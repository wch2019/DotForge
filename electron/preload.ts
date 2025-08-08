import {ipcRenderer, contextBridge} from 'electron'
import {type AppConfig} from '../shared/default-config'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...omit] = args
        return ipcRenderer.invoke(channel, ...omit)
    },

    // You can expose other APTs you need here.
    // ...
})

// 暴露窗口控制API
contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    // 配置文件相关
    readConfig: () => ipcRenderer.invoke('config-read'),
    writeConfig: (config: AppConfig) => ipcRenderer.invoke('config-write', config),
    getConfigPath: () => ipcRenderer.invoke('config-get-path'),
    selectPath: (type = 'file') => ipcRenderer.invoke('dialog:selectPath', {type}),
    migrateDataDir: (oldPath: string, newPath: string) => ipcRenderer.invoke('config-migrate-data-dir', oldPath, newPath),
    // 项目数据库操作
})
