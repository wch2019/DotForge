// import Database from 'better-sqlite3';
// import { app } from 'electron';
// import path from 'path';
//
// const dbPath = path.join(app.getPath('userData'), 'ci-cd.db');
// const db = new Database(dbPath);
//
// // 初始化表
// db.exec(`
//   CREATE TABLE IF NOT EXISTS projects (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     path TEXT NOT NULL,
//     build_command TEXT,
//     output_dir TEXT,
//     deploy_method TEXT,
//     config TEXT,
//     created_at TEXT DEFAULT CURRENT_TIMESTAMP
//   );
// `);
//
// export function insertProject(data: {
//     name: string;
//     path: string;
//     build_command: string;
//     output_dir: string;
//     deploy_method: string;
//     config: string;
// }) {
//     const stmt = db.prepare(`
//     INSERT INTO projects (name, path, build_command, output_dir, deploy_method, config)
//     VALUES (@name, @path, @build_command, @output_dir, @deploy_method, @config)
//   `);
//     stmt.run(data);
// }
//
// export function listProjects() {
//     const stmt = db.prepare(`SELECT * FROM projects ORDER BY created_at DESC`);
//     return stmt.all();
// }
