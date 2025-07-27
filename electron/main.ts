import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

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
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

// 数据存储相关
const DEFAULT_DATA_DIR = path.join(app.getPath('documents'), 'DotForge', 'data')
let dataDir = DEFAULT_DATA_DIR

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 获取数据文件路径
function getDataFilePath(filename: string): string {
  return path.join(dataDir, filename)
}

// 读取JSON文件
function readJsonFile(filename: string): any {
  const filePath = getDataFilePath(filename)
  if (!fs.existsSync(filePath)) {
    return null
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error)
    return null
  }
}

// 写入JSON文件
function writeJsonFile(filename: string, data: any): boolean {
  try {
    ensureDataDir()
    const filePath = getDataFilePath(filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`写入文件失败: ${filename}`, error)
    return false
  }
}

function createWindow() {
  win = new BrowserWindow({
    title: 'DotForge', // 设置窗口标题
    frame: false, // 隐藏原生标题栏
    titleBarStyle: 'hidden', // macOS 额外可加
    icon: iconPath, // 使用统一的图标路径
    minWidth: 830, // 最小宽度
    minHeight: 750, // 最小高度
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 设置应用名称和图标
app.setName('DotForge')
app.setAppUserModelId('DotForge')

// 设置应用图标路径
const iconPath = path.join(process.env.VITE_PUBLIC, 'dot-forge.png')

app.whenReady().then(() => {
  // 确保数据目录存在
  ensureDataDir()
  
  createWindow()
  
  // 窗口控制事件处理
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
  
  ipcMain.handle('window-is-maximized', () => {
    return win?.isMaximized()
  })
  
  // 监听窗口最大化状态变化
  win?.on('maximize', () => {
    win?.webContents.send('window-maximize-change', true)
  })
  
  win?.on('unmaximize', () => {
    win?.webContents.send('window-maximize-change', false)
  })
  
  // 数据存储相关IPC处理
  ipcMain.handle('data-read', async (_, filename: string) => {
    return readJsonFile(filename)
  })
  
  ipcMain.handle('data-write', async (_, filename: string, data: any) => {
    return writeJsonFile(filename, data)
  })
  
  ipcMain.handle('data-get-dir', async () => {
    return dataDir
  })
  
  ipcMain.handle('data-set-dir', async (_, newDir: string) => {
    if (fs.existsSync(newDir) || fs.mkdirSync(newDir, { recursive: true })) {
      dataDir = newDir
      return true
    }
    return false
  })
})
