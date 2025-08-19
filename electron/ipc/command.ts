import { ipcMain } from "electron";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { exec } from "child_process";

let currentProcess: ChildProcessWithoutNullStreams | null = null;

// ✅ 跨平台的命令执行和停止
export function registerCommandHandlers() {
    // 运行命令
    ipcMain.handle("run-command", (event, fullCommand, options) => {
        return new Promise((resolve) => {
            // 自动拆分命令
            const parts = fullCommand.split(' ')
            const command = parts[0]
            const args = parts.slice(1)

            currentProcess = spawn(command, args, {shell: true, ...options})

            // 监听 stdout
            currentProcess.stdout.on("data", (data) => {
                event.sender.send("command-output", data.toString());
            });

            // 监听 stderr
            currentProcess.stderr.on("data", (data) => {
                event.sender.send("command-output", data.toString());
            });

            // 监听退出
            currentProcess.on("close", (code) => {
                currentProcess = null;
                event.sender.send("command-finished", code);
                resolve(code);
            });
        });
    });

    // 停止命令
    ipcMain.handle("stop-command", () => {
        if (currentProcess && currentProcess.pid) {
            try {
                if (process.platform === "win32") {
                    // ✅ Windows：杀掉整个进程树
                    exec(`taskkill /pid ${currentProcess.pid} /T /F`);
                } else {
                    // ✅ Linux / macOS：杀掉进程组
                    process.kill(-currentProcess.pid, "SIGTERM");
                }
            } catch (err) {
                console.error("❌ Kill process failed", err);
            } finally {
                currentProcess = null;
            }
            return true;
        }
        return false;
    });

}
