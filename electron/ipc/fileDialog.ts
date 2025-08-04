import { dialog, ipcMain } from 'electron'

export function registerFileDialogHandler() {
    ipcMain.handle('dialog:selectPath', async (_event, options: { type: 'file' | 'directory' }) => {
        const properties = options.type === 'directory' ? ['openDirectory'] : ['openFile']

        const result = await dialog.showOpenDialog({
            title: options.type === 'directory' ? '选择文件夹' : '选择文件',
            properties
        })

        if (result.canceled || result.filePaths.length === 0) return null
        return result.filePaths[0]
    })
}
