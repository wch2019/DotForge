import Database from 'better-sqlite3'
import path from 'node:path'
import { readConfig } from '../ipc/setting'
const config = readConfig()
const dataDir = config.defaultProjectPath
// 指定数据库文件路径
const dbPath = path.join(dataDir,'data','data.db')

// 创建 SQLite 实例
const db = new Database(dbPath)

// 初始化表
db.prepare(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    localPath TEXT,
    description TEXT,
    tag TEXT,

    buildCmd TEXT,
    outputDir TEXT,

    deployMethod TEXT,
    dockerfilePath TEXT,
    imageName TEXT,
    registry TEXT,
    localCommand TEXT,
    dockerDeployType TEXT,
    dockerRunCommand TEXT,
    serverAddress TEXT,
    serverPort INTEGER,
    serverUsername TEXT,
    authType TEXT,
    serverPassword TEXT,
    privateKeyPath TEXT,
    targetPath TEXT,
    remoteCommand TEXT,

    keepArtifacts INTEGER,
    keepPath TEXT,
    keepCount INTEGER
  )
`).run()

export default db
