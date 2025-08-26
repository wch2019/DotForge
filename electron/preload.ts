import {ipcRenderer, contextBridge} from 'electron'
import {type AppConfig} from '@/types/defaultConfig.ts'
import {ProjectData} from "@/types/project.ts";

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
    createProject: (projectData: ProjectData) => ipcRenderer.invoke('project:create', projectData),
    updateProject: (id: number, projectData: ProjectData) => ipcRenderer.invoke('project:update', id, projectData),
    deleteProject: (id: number) => ipcRenderer.invoke('project:delete', id),
    getProjects: () => ipcRenderer.invoke('project:getAll'),
    getProjectById: (id: number) => ipcRenderer.invoke('project:getById', id),
    // cmd 执行
    runCommand: (cmd: string, options: any) => ipcRenderer.invoke('run-command', cmd, options),
    stopCommand: () => ipcRenderer.invoke('stop-command'),
    onCommandOutput: (callback: any) => ipcRenderer.on('command-output', (_, data) => callback(data)),
    onCommandFinished: (callback: any) => ipcRenderer.on('command-finished', (_, code) => callback(code)),
    // 构建日志相关
    getBuildLogs: (projectId?: string) => ipcRenderer.invoke('build:getAll', projectId),
    getBuildLogById: (id: number) => ipcRenderer.invoke('build:getById', id),
    createBuildLog: (logData: any) => ipcRenderer.invoke('build:create', logData),
    updateBuildLog: (id: number, logData: any) => ipcRenderer.invoke('build:update', id, logData),
    deleteBuildLog: (id: number) => ipcRenderer.invoke('build:delete', id),
    // 服务器管理相关
    getServers: () => ipcRenderer.invoke('server:getAll'),
    getServerById: (id: number) => ipcRenderer.invoke('server:getById', id),
    createServer: (data: any) => ipcRenderer.invoke('server:create', data),
    updateServer: (id: number, data: any) => ipcRenderer.invoke('server:update', id, data),
    deleteServer: (id: number) => ipcRenderer.invoke('server:delete', id),
    testServerConnection: (data: any) => ipcRenderer.invoke('server:test', data),
    // SSH相关
    connectSSH: (config: any) => ipcRenderer.invoke('ssh:connect', config),
    executeSSHCommand: (connectionId: string, command: string) => ipcRenderer.invoke('ssh:execute', connectionId, command),
    getSSHSystemInfo: (connectionId: string) => ipcRenderer.invoke('ssh:getSystemInfo', connectionId),
    disconnectSSH: (connectionId: string) => ipcRenderer.invoke('ssh:disconnect', connectionId),
    isSSHConnected: (connectionId: string) => ipcRenderer.invoke('ssh:isConnected', connectionId),
    getSSHConnectionCount: () => ipcRenderer.invoke('ssh:getConnectionCount'),
    ssh: {
        // 创建交互式 Shell
        createShell: (connectionId: string) => ipcRenderer.invoke('ssh:createShell', connectionId),
        // 向指定连接写入数据
        send: (channel: string, data: any) => ipcRenderer.send(channel, data),
        // 监听事件
        on: (channel: string, callback: (data: any) => void) => {
            const subscription = (_: any, data: any) => callback(data)
            ipcRenderer.on(channel, subscription)
            return () => ipcRenderer.removeListener(channel, subscription) // 提供解绑函数
        }
    },

})
