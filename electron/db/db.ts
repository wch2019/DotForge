import path from 'path'
import fs from 'fs-extra'
import {createRequire} from 'module'
import {readConfig} from "../ipc/setting.ts";

// 因为 better-sqlite3 是 CJS 模块，ESM 模式下需要用 createRequire 来加载
const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

// 获取数据库配置
const config = readConfig();
const CONFIG_PATH = config.defaultProjectPath;
const DATA_DIR = path.join(CONFIG_PATH, 'data')


export function getDatabase() {
    // 确保目录存在
    const dbDir = path.dirname(DATA_DIR);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    // 默认数据库路径在 data 文件夹下
    const defaultDbPath = path.join(dbDir, 'data.db')

    const db = new Database(defaultDbPath)
    db.pragma('journal_mode = WAL')
    return db
}