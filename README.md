
## 🖥️ DotForge

一个基于 **Electron + Vue 3 + Naive UI** 构建的本地化桌面端 CI/CD 工具，用于离线打包、构建并部署 Java 项目，适用于内网环境或私有部署场景。

---

## ✨ 项目特性

- ⚡ 本地运行，无需网络、无依赖服务器
- 🧱 支持 Java 项目（Maven）本地构建
- 🚀 支持多种发布方式：
  - 不发布
  - 本地命令执行
  - Docker 镜像构建与推送
  - 远程服务器上传与部署（SSH/SFTP）
- 📦 项目配置本地持久化（使用 SQLite）
- 🌓 支持暗黑模式切换
- 💡 简洁美观 UI，基于 Naive UI + TailwindCSS
- 🔧 支持配置产物保留策略（路径/数量）

---

## 🧰 技术栈

| 技术       | 用途                |
|------------|---------------------|
| [Electron](https://www.electronjs.org/)     | 桌面应用容器 |
| [Vue 3](https://vuejs.org/)                | 前端框架      |
| [Vite](https://vitejs.dev/)               | 构建工具      |
| [TailwindCSS](https://tailwindcss.com/)    | 样式系统      |
| [Naive UI](https://www.naiveui.com/)       | UI 组件库     |
| [SQLite + better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 数据持久化    |

---

## 📦 安装与启动

### 1. 安装依赖

```bash
npm install
````

### 2. 启动开发模式

```bash
npm run dev
```

### 3. 打包构建应用

```bash
npm run build
```

---

## 🧩 项目结构

```
├─ src/                  # 前端源代码（Vue）
│  ├─ views/             # 页面视图（项目列表、新建、日志等）
│  ├─ components/        # 公共组件
│  ├─ router/            # 路由配置
│  ├─ store/             # 状态管理（可选）
│  └─ App.vue            # 顶层布局（含标题栏/暗黑模式按钮）
├─ electron/             # Electron 主进程
│  ├─ db/                # SQLite 封装
│  ├─ preload.ts         # API 暴露至前端
│  └─ main.ts            # Electron 启动入口
├─ public/
├─ package.json
├─ vite.config.ts
└─ README.md
```

---

## 📁 数据模型

使用 SQLite 本地数据库持久化所有项目配置。

项目表结构（`projects`）：

---

## 💬 TODO

* [ ] 构建日志查看功能
* [ ] 定时任务支持
* [ ] 导入导出配置
* [ ] 系统托盘/最小化隐藏

---

## 📃 许可证

MIT License © 2025 xiaohai
