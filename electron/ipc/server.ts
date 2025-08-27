import {ipcMain} from 'electron'
import {server as serverTable} from "../db/schema.ts";
import {getDb} from "../db";
import {desc, eq} from "drizzle-orm";

export type ServerInsert = Omit<typeof serverTable.$inferInsert, 'id'>
export type ServerUpdate = Partial<typeof serverTable.$inferUpdate>

// 直接使用单例 db
const db = getDb();

export function createServer(data: ServerInsert) {
  return db.insert(serverTable).values(data).returning()
}

export function getServers() {
  return db.select().from(serverTable).orderBy(desc(serverTable.createdTime)).all()
}

export function getServerById(id: number) {
  return db.select().from(serverTable).where(eq(serverTable.id, id)).get()
}

export function updateServer(id: number, data: ServerUpdate) {
  return db.update(serverTable).set(data).where(eq(serverTable.id, id)).returning()
}

export function deleteServer(id: number) {
  return db.delete(serverTable).where(eq(serverTable.id, id)).returning()
}

export function getServerIdNameList() {
    return db
        .select({
            id: serverTable.id,
            name: serverTable.name,
            host: serverTable.host
        })
        .from(serverTable)
        .orderBy(desc(serverTable.createdTime))
        .all();
}

export function registerServerHandlers() {
    handleIpc("server:create", createServer);
    handleIpc("server:getAll", getServers);
    handleIpc("server:getById", getServerById);
    handleIpc("server:update", updateServer);
    handleIpc("server:delete", deleteServer);
    handleIpc("server:getIdNameList", getServerIdNameList);
}

// ---------------- IPC 注册 ----------------
function handleIpc<T extends (...args: any[]) => Promise<any> | any>(
    channel: string,
    handler: T
) {
    ipcMain.handle(channel, async (_event, ...args) => {
        try {
            return await handler(...args);
        } catch (e) {
            console.error(`[${channel}] 处理失败:`, e);
            throw e;
        }
    });
}


