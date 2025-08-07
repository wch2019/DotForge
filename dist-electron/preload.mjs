"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => electron.ipcRenderer.send("window-minimize"),
  maximize: () => electron.ipcRenderer.send("window-maximize"),
  close: () => electron.ipcRenderer.send("window-close"),
  // 配置文件相关
  readConfig: () => electron.ipcRenderer.invoke("config-read"),
  writeConfig: (config) => electron.ipcRenderer.invoke("config-write", config),
  getConfigPath: () => electron.ipcRenderer.invoke("config-get-path"),
  selectPath: (type = "file") => electron.ipcRenderer.invoke("dialog:selectPath", { type }),
  migrateDataDir: (oldPath, newPath) => electron.ipcRenderer.invoke("config-migrate-data-dir", oldPath, newPath),
  // 添加项目
  addProject: (projectData) => electron.ipcRenderer.invoke("project:add", projectData),
  // 获取项目列表
  getAllProjects: () => electron.ipcRenderer.invoke("project:list")
});
