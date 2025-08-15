import {ipcMain} from 'electron';
import {spawn, ChildProcessWithoutNullStreams} from "child_process";

// ✅ 全局变量，供 run-command 和 stop-command 共用
let currentProcess: ChildProcessWithoutNullStreams | null = null

// CICD 命令执行
export function registerCommandHandlers() {
    ipcMain.handle('run-command', (event, fullCommand, options) => {
        return new Promise((resolve) => {
            // 自动拆分命令
            const parts = fullCommand.split(' ')
            const command = parts[0]
            const args = parts.slice(1)

            currentProcess = spawn(command, args, {shell: true, ...options})

            currentProcess.stdout.on('data', (data) => {
                event.sender.send('command-output', data.toString())
            })

            currentProcess.stderr.on('data', (data) => {
                event.sender.send('command-output', data.toString())
            })

            currentProcess.on('close', (code) => {
                currentProcess = null
                event.sender.send('command-finished', code)
                resolve(code)
            })
        })
    })
    // 停止命令
    ipcMain.handle('stop-command', () => {
        if (currentProcess) {
            currentProcess.kill('SIGTERM') // 或 'SIGKILL' 强制结束
            currentProcess = null
            return true
        }
        return false
    })
}
