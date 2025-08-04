// src/main/services/setting.ts
import fs from 'node:fs'
import path from 'node:path'
// import fse from 'fs-extra'
import {app, ipcMain} from 'electron'

// 设置文件名称
const CONFIG_FILE_NAME = 'config.json'

// 获取 userData 路径
const CONFIG_DIR = app.getPath('userData')

// 配置文件完整路径
const CONFIG_PATH = path.join(CONFIG_DIR, CONFIG_FILE_NAME)

// ✅ 设置默认数据目录（文档/DotForge）
const DEFAULT_DATA_DIR = path.join(app.getPath('documents'), 'DotForge');

// 默认配置内容
export const defaultConfig: AppConfig = {
    theme: 'light',
    language: 'zh-CN',
    autoUpdate: true,
    defaultProjectPath: DEFAULT_DATA_DIR
}

// 配置文件类型定义
export interface AppConfig {
    theme: 'light' | 'dark' | 'auto'
    language: string
    autoUpdate: boolean
    defaultProjectPath: string
}

// 确保配置文件存在
function ensureConfigFile(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true })
    }
    if (!fs.existsSync(DEFAULT_DATA_DIR)) {
        fs.mkdirSync(DEFAULT_DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), 'utf8')
    }
}

// 获取配置文件路径（调试用）
export function getConfigPath(): string {
    return CONFIG_PATH
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


/**
 * 迁移数据目录
 * @param oldPath 旧目录路径
 * @param newPath 新目录路径
 * @returns 是否成功
 */
export async function migrateDataDir(oldPath: string, newPath: string): Promise<boolean> {
    try {
        // 确保新路径存在
        if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath, {recursive: true})
        }

        // 拷贝旧数据
        await fse.copy(oldPath, newPath, {
            overwrite: true,
            errorOnExist: false
        })

        // 删除旧目录：
        // await fse.remove(oldPath)

        return true
    } catch (e) {
        console.error('[设置] 数据迁移失败', e)
        return false
    }
}

// 注册所有 setting 相关 IPC
export function registerSettingHandler() {
    ipcMain.handle('config-get-path', () => getConfigPath())
    ipcMain.handle('config-read', () => readConfig())
    ipcMain.handle('config-write', (_event, newConfig) => writeConfig(newConfig))
    ipcMain.handle('config-migrate-data-dir', async (_e, oldPath, newPath) => {
        return await migrateDataDir(oldPath, newPath)
    })
}

