/// <reference types="vite/client" />

import {AppConfig} from "../electron/ipc/setting.ts";

export {}

declare global {
    interface Window {
        electronAPI: {
            getConfigPath: () => string
            readConfig: () => Promise<AppConfig>
            writeConfig: (config: AppConfig) => Promise<void>
            onConfigChange?: (callback: (newConfig: any) => void) => void
            selectPath: (type?: 'file' | 'directory') => Promise<string>
            migrateDataDir: (oldPath: string, newPath: string) => Promise<void>

            // 项目相关
            createProject: (projectData: any) => Promise<any>
            updateProject: (id: number, projectData: any) => Promise<any>
            deleteProject: (id: number) => Promise<any>
            getProjects: () => Promise<any[]>
            getProjectById: (id: number) => Promise<any>

            // 命令相关
            runCommand: (cmd: string, options: any) => Promise<any>
            stopCommand: () => Promise<any>
            onCommandOutput: (callback: (data: any) => void) => void
            onCommandFinished: (callback: (code: number) => void) => void

            // 构建日志
            getBuildLogs: (projectId?: string) => Promise<any[]>
            getBuildLogById: (id: number) => Promise<any>
            createBuildLog: (logData: any) => Promise<any>
            updateBuildLog: (id: number, logData: any) => Promise<any>
            deleteBuildLog: (id: number) => Promise<any>

            // 服务器相关
            getServers: () => Promise<any[]>
            getServerById: (id: number) => Promise<any>
            createServer: (data: any) => Promise<any>
            updateServer: (id: number, data: any) => Promise<any>
            deleteServer: (id: number) => Promise<any>
            testServerConnection: (data: any) => Promise<boolean>
        }
    }
}

