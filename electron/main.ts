import {app, BrowserWindow, ipcMain} from 'electron'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {registerAllIpcHandlers} from './ipc'
import {getDatabase} from "./db/db.ts";
// 当前文件所在目录
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
// 设置应用根目录
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
// 环境变量：开发模式下使用 VITE_DEV_SERVER_URL
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
// 主进程构建目录
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
// 渲染进程构建目录
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
// 设置资源目录（开发模式使用 public，生产模式使用构建好的 dist）
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// 设置应用图标路径
const iconPath = path.join(process.env.VITE_PUBLIC, 'dot-forge.png')

// 主窗口引用
let win: BrowserWindow | null

// 创建主窗口
function createWindow() {
    win = new BrowserWindow({
        title: 'DotForge',           // 应用窗口标题
        frame: false,                // 隐藏原生标题栏
        titleBarStyle: 'hidden',     // macOS 特有样式
        icon: iconPath,              // 应用图标路径
        minWidth: 830,               // 最小宽度限制
        minHeight: 640,              // 最小高度限制
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'), // 预加载脚本
        },
    })
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools()
    }

    // 页面加载完成后，发送消息给渲染进程
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    //加载页面：开发模式加载本地服务器，生产模式加载本地文件
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }

    // 监听窗口最大化和恢复事件，通知渲染进程
    win.on('maximize', () => {
        win?.webContents.send('window-maximize-change', true)
    })

    win.on('unmaximize', () => {
        win?.webContents.send('window-maximize-change', false)
    })
}

// 当所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

// macOS 特有行为：点击 Dock 图标重新创建窗口
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// 设置应用名称与 ID（Windows 任务栏识别用）
app.setName('DotForge')
app.setAppUserModelId('DotForge')


// 应用启动完成时初始化窗口和监听
app.whenReady().then(() => {
// 添加这两行代码
    console.log('start...')
// 初始化数据库
    const db = getDatabase()
    console.log('数据库已连接')

    // 测试查询
    const row = db.prepare('SELECT 1 AS value').get()
    console.log('SQLite 测试结果:', row)
    createWindow()

    // ====================
    // 窗口控制相关 IPC 通信
    // ====================
    ipcMain.on('window-minimize', () => {
        win?.minimize()
    })

    ipcMain.on('window-maximize', () => {
        if (win?.isMaximized()) {
            win.unmaximize()
        } else {
            win?.maximize()
        }
    })

    ipcMain.on('window-close', () => {
        win?.close()
    })

    // 集中注册
    registerAllIpcHandlers()
})
