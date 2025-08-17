// 配置文件类型定义
export interface AppConfig {
    theme: 'light' | 'dark' | 'auto'
    language: string
    autoUpdate: boolean
    defaultProjectPath: string
}

// 默认配置
export const defaultConfig: AppConfig = {
    theme: 'light',
    language: 'zh-CN',
    autoUpdate: true,
    defaultProjectPath: ''
}
