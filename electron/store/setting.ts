// src/main/services/setting.ts
import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'

// 设置文件名称
const CONFIG_FILE_NAME = 'config.json'

// 获取 userData 路径
const CONFIG_DIR = app.getPath('userData')

// 配置文件完整路径
const CONFIG_PATH = path.join(CONFIG_DIR, CONFIG_FILE_NAME)

// 默认配置内容
const defaultConfig: AppConfig = {
    theme: 'light',
    language: 'zh-CN',
    autoUpdate: true,
    keepArtifacts: true,
    defaultProjectPath: ''
}

// 配置文件类型定义
export interface AppConfig {
    theme: 'light' | 'dark'
    language: string
    autoUpdate: boolean
    keepArtifacts: boolean
    defaultProjectPath: string
}

// 确保配置文件存在
function ensureConfigFile(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true })
    }
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf8')
    }
}

// 读取配置
export function readConfig(): AppConfig {
    ensureConfigFile()
    try {
        const content = fs.readFileSync(CONFIG_PATH, 'utf8')
        const parsed = JSON.parse(content)

        // 可加字段校验逻辑，这里简单返回
        return parsed as AppConfig
    } catch (e) {
        console.error('[设置] 读取配置失败，使用默认配置', e)
        return defaultConfig
    }
}

// 写入配置
export function writeConfig(config: AppConfig): boolean {
    try {
        ensureConfigFile()
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8')
        return true
    } catch (e) {
        console.error('[设置] 写入配置失败', e)
        return false
    }
}

// 获取配置文件路径（调试用）
export function getConfigPath(): string {
    return CONFIG_PATH
}
