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
  // 项目数据库操作
  createProject: (projectData) => electron.ipcRenderer.invoke("project:create", projectData),
  updateProject: (id, projectData) => electron.ipcRenderer.invoke("project:update", id, projectData),
  deleteProject: (id) => electron.ipcRenderer.invoke("project:delete", id),
  getProjects: () => electron.ipcRenderer.invoke("project:getAll"),
  getProjectById: (id) => electron.ipcRenderer.invoke("project:getById", id),
  // cmd 执行
  runCommand: (cmd, options) => electron.ipcRenderer.invoke("run-command", cmd, options),
  stopCommand: () => electron.ipcRenderer.invoke("stop-command"),
  onCommandOutput: (callback) => electron.ipcRenderer.on("command-output", (_, data) => callback(data)),
  onCommandFinished: (callback) => electron.ipcRenderer.on("command-finished", (_, code) => callback(code)),
  // 构建日志相关
  getBuildLogs: (projectId) => electron.ipcRenderer.invoke("build:getAll", projectId),
  getBuildLogById: (id) => electron.ipcRenderer.invoke("build:getById", id),
  createBuildLog: (logData) => electron.ipcRenderer.invoke("build:create", logData),
  updateBuildLog: (id, logData) => electron.ipcRenderer.invoke("build:update", id, logData),
  deleteBuildLog: (id) => electron.ipcRenderer.invoke("build:delete", id)
});
