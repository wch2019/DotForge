import path from "path";
import fs from "fs-extra";
import {createRequire} from "module";
import {drizzle} from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import {readConfig} from "../ipc/setting.ts";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

let dbSingleton: ReturnType<typeof drizzle> | null = null;

export function getDb() {
    if (dbSingleton) return dbSingleton;

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
        console.log(`连接到数据库: ${dbPath}`)
    }

    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");

    // 这里直接创建表（如果不存在）
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS project (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            createdTime TEXT,
            name TEXT NOT NULL,
            localPath TEXT NOT NULL,
            description TEXT,
            tag TEXT,
            buildCmd TEXT,
            outputDir TEXT,
            deployMethod TEXT,
            localCommand TEXT,
            dockerfilePath TEXT,
            imageName TEXT,
            registry TEXT,
            dockerDeployType TEXT,
            dockerRunCommand TEXT,
            serverId INTEGER,
            targetPath TEXT,
            remoteCommand TEXT,
            keepArtifacts INTEGER,
            keepPath TEXT,
            keepCount INTEGER,
            lastBuildTime TEXT,
            status TEXT
            );
    `);
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS project_build (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            projectId TEXT NOT NULL,
            projectName TEXT NOT NULL,
            command TEXT NOT NULL,
            localPath TEXT,
            status TEXT NOT NULL,
            artifactPath TEXT,
            artifactSize INTEGER,
            logs TEXT,
            startTime TEXT,
            endTime TEXT
        );
    `);

    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS server (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            createdTime TEXT,
            name TEXT NOT NULL,
            tag TEXT,
            host TEXT NOT NULL,
            port INTEGER DEFAULT 22,
            username TEXT NOT NULL,
            authType TEXT,
            password TEXT,
            privateKeyPath TEXT,
            description TEXT
        );
    `);

    dbSingleton = drizzle(sqlite, {schema});
    return dbSingleton;
}
