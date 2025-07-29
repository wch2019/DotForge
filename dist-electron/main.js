import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
const DEFAULT_DATA_DIR = path.join(app.getPath("documents"), "DotForge", "data");
let dataDir = DEFAULT_DATA_DIR;
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
function getDataFilePath(filename) {
  return path.join(dataDir, filename);
}
function readJsonFile(filename) {
  const filePath = getDataFilePath(filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return null;
  }
}
function writeJsonFile(filename, data) {
  try {
    ensureDataDir();
    const filePath = getDataFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(`写入文件失败: ${filename}`, error);
    return false;
  }
}
function createWindow() {
  win = new BrowserWindow({
    title: "DotForge",
    // 设置窗口标题
    frame: false,
    // 隐藏原生标题栏
    titleBarStyle: "hidden",
    // macOS 额外可加
    icon: iconPath,
    // 使用统一的图标路径
    minWidth: 830,
    // 最小宽度
    minHeight: 640,
    // 最小高度
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.setName("DotForge");
app.setAppUserModelId("DotForge");
const iconPath = path.join(process.env.VITE_PUBLIC, "dot-forge.png");
app.whenReady().then(() => {
  ensureDataDir();
  createWindow();
  ipcMain.on("window-minimize", () => {
    win == null ? void 0 : win.minimize();
  });
  ipcMain.on("window-maximize", () => {
    if (win == null ? void 0 : win.isMaximized()) {
      win.unmaximize();
    } else {
      win == null ? void 0 : win.maximize();
    }
  });
  ipcMain.on("window-close", () => {
    win == null ? void 0 : win.close();
  });
  ipcMain.handle("window-is-maximized", () => {
    return win == null ? void 0 : win.isMaximized();
  });
  win == null ? void 0 : win.on("maximize", () => {
    win == null ? void 0 : win.webContents.send("window-maximize-change", true);
  });
  win == null ? void 0 : win.on("unmaximize", () => {
    win == null ? void 0 : win.webContents.send("window-maximize-change", false);
  });
  ipcMain.handle("data-read", async (_, filename) => {
    return readJsonFile(filename);
  });
  ipcMain.handle("data-write", async (_, filename, data) => {
    return writeJsonFile(filename, data);
  });
  ipcMain.handle("data-get-dir", async () => {
    return dataDir;
  });
  ipcMain.handle("data-set-dir", async (_, newDir) => {
    if (fs.existsSync(newDir) || fs.mkdirSync(newDir, { recursive: true })) {
      dataDir = newDir;
      return true;
    }
    return false;
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
