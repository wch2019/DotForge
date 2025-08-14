import {ipcMain} from 'electron';
import {spawn} from "child_process";


// CICD 命令执行
export function registerCommandHandlers() {
    ipcMain.handle('run-command', (event, fullCommand, options) => {
        return new Promise((resolve) => {
            // 自动拆分命令
            const parts = fullCommand.split(' ')
            const command = parts[0]
            const args = parts.slice(1)

            const child = spawn(command, args, {shell: true, ...options})

            child.stdout.on('data', (data) => {
                event.sender.send('command-output', data.toString())
            })

            child.stderr.on('data', (data) => {
                event.sender.send('command-output', data.toString())
            })

            child.on('close', (code) => {
                event.sender.send('command-finished', code)
                resolve(code)
            })
        })
    })
}
