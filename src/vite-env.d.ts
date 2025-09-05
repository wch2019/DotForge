/// <reference types="vite/client" />

import {AppConfig} from "../electron/ipc/setting.ts";

export {}

declare global {
    interface Window {
        electronAPI: {
            // 窗口控制
            minimize: () => void
            maximize: () => void
            close: () => void

            // 配置文件相关
            getConfigPath: () => string
            readConfig: () => Promise<AppConfig>
            writeConfig: (config: AppConfig) => Promise<void>
            onConfigChange?: (callback: (newConfig: any) => void) => void
            selectPath: (type?: 'file' | 'directory') => Promise<string>
            migrateDataDir: (oldPath: string, newPath: string) => Promise<void>

            // 项目数据库操作
            createProject: (projectData: any) => Promise<any>
            updateProject: (id: number, projectData: any) => Promise<any>
            deleteProject: (id: number) => Promise<any>
            getProjects: () => Promise<any[]>
            getProjectById: (id: number) => Promise<any>

            // cmd 执行
            runCommand: (cmd: string, options: any) => Promise<any>
            stopCommand: () => Promise<any>
            onCommandOutput: (callback: (data: any) => void) => void
            onCommandFinished: (callback: (code: number) => void) => void

            // 构建日志相关
            getBuildLogs: (projectId?: string) => Promise<any[]>
            getBuildLogById: (id: number) => Promise<any>
            createBuildLog: (logData: any) => Promise<any>
            updateBuildLog: (id: number, logData: any) => Promise<any>
            deleteBuildLog: (id: number) => Promise<any>

            // 服务器管理相关
            server: {
                getServers: () => Promise<any[]>
                getServerById: (id: number) => Promise<any>
                createServer: (data: any) => Promise<any>
                updateServer: (id: number, data: any) => Promise<any>
                deleteServer: (id: number) => Promise<any>
                getIdNameList: () => Promise<any[]>
            }

            // SSH相关
            connectSSH: (config: any) => Promise<string>
            executeSSHCommand: (connectionId: string, command: string) => Promise<string>
            getSSHSystemInfo: (connectionId: string) => Promise<any>
            createSSHShell: (connectionId: string) => Promise<any>
            disconnectSSH: (connectionId: string) => Promise<boolean>
            isSSHConnected: (connectionId: string) => Promise<boolean>
            getSSHConnectionCount: () => Promise<number>
            uploadDir: (connectionId: string, {localPath, removePrefix, sourceFiles}: {
                localPath: string,
                removePrefix?: string,
                sourceFiles: string[],
                remoteDir: string
            }) => Promise<boolean>
            ssh: {
                testSSHConnection: (config: any) => Promise<boolean>
                createShell: (connectionId: string) => Promise<any>
                send: (channel: string, data: any) => void
                on: (channel: string, callback: (data: any) => void) => () => void
            }
        }

        $message: {
            success: (message: string) => void
            error: (message: string) => void
            warning: (message: string) => void
            info: (message: string) => void
        }
    }
}

