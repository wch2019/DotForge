import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs'
import { readConfig } from '../ipc/setting';

// 获取数据库配置
const config = readConfig();
const dataDir = config.defaultProjectPath;
const dbPath = path.join(dataDir, 'data', 'data.db');

/**
 * 初始化数据库
 * 创建项目表
 */
export function initDatabase() {
  try {
    // 确保目录存在
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 打开数据库连接
    const db = new Database(dbPath);

    // 创建项目表
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        localPath TEXT NOT NULL,
        description TEXT,
        tag TEXT,
        buildCmd TEXT,
        outputDir TEXT,
        deployMethod TEXT CHECK(deployMethod IN ('none', 'local', 'docker', 'remote')),
        localCommand TEXT,
        dockerfilePath TEXT,
        imageName TEXT,
        registry TEXT,
        dockerDeployType TEXT CHECK(dockerDeployType IN ('local', 'push')),
        dockerRunCommand TEXT,
        serverAddress TEXT,
        serverPort INTEGER,
        serverUsername TEXT,
        authType TEXT CHECK(authType IN ('password', 'privateKey')),
        serverPassword TEXT,
        privateKeyPath TEXT,
        targetPath TEXT,
        remoteCommand TEXT,
        keepArtifacts BOOLEAN,
        keepPath TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('数据库初始化成功，项目表已创建');
    db.close();
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
}
