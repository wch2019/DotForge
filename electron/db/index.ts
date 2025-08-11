import path from "path";
import fs from "fs-extra";
import {createRequire} from "module";
import {drizzle} from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import {readConfig} from "../ipc/setting.ts";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

export function getDb() {
    const config = readConfig();
    const CONFIG_PATH = config.defaultProjectPath;

    // 如果 defaultProjectPath 是文件夹，则放在 data/data.db
    const isDir = path.extname(CONFIG_PATH) === "";
    let dbPath: string;
    if (isDir) {
        const dataDir = path.join(CONFIG_PATH, "data");
        fs.ensureDirSync(dataDir);
        dbPath = path.join(dataDir, "data.db");
    } else {
        fs.ensureDirSync(path.dirname(CONFIG_PATH));
        dbPath = CONFIG_PATH;
    }

    const isNew = !fs.existsSync(dbPath);
    if (isNew) {
        console.log("📦 创建新的 SQLite 数据库:", dbPath);
        fs.writeFileSync(dbPath, "");
    } else {
        console.log(`连接数据库: ${dbPath}`)
    }

    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");

    const db = drizzle(sqlite, {schema});


    return db;
}
