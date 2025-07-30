import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const CONFIG_FILE_NAME = "config.json";
const CONFIG_DIR = app.getPath("userData");
const CONFIG_PATH = path.join(CONFIG_DIR, CONFIG_FILE_NAME);
const defaultConfig = {
  theme: "light",
  language: "zh-CN",
  autoUpdate: true,
  keepArtifacts: true,
  defaultProjectPath: ""
};
function ensureConfigFile() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2), "utf8");
  }
}
function readConfig() {
  ensureConfigFile();
  try {
    const content = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(content);
    return parsed;
  } catch (e) {
    console.error("[设置] 读取配置失败，使用默认配置", e);
    return defaultConfig;
  }
}
function writeConfig(config) {
  try {
    ensureConfigFile();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("[设置] 写入配置失败", e);
    return false;
  }
}
function getConfigPath() {
  return CONFIG_PATH;
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
const iconPath = path.join(process.env.VITE_PUBLIC, "dot-forge.png");
let win;
function createWindow() {
  win = new BrowserWindow({
    title: "DotForge",
    // 应用窗口标题
    frame: false,
    // 隐藏原生标题栏
    titleBarStyle: "hidden",
    // macOS 特有样式
    icon: iconPath,
    // 应用图标路径
    minWidth: 830,
    // 最小宽度限制
    minHeight: 640,
    // 最小高度限制
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
      // 预加载脚本
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
  win.on("maximize", () => {
    win == null ? void 0 : win.webContents.send("window-maximize-change", true);
  });
  win.on("unmaximize", () => {
    win == null ? void 0 : win.webContents.send("window-maximize-change", false);
  });
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
app.whenReady().then(() => {
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
  ipcMain.handle("config-read", () => {
    return readConfig();
  });
  ipcMain.handle("config-write", (_event, newConfig) => {
    return writeConfig(newConfig);
  });
  ipcMain.handle("config-get-path", () => {
    return getConfigPath();
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
