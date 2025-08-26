import {ipcMain} from 'electron'
import {server as serverTable} from "../db/schema.ts";
import {getDb} from "../db";
import {desc, eq} from "drizzle-orm";

export type ServerInsert = Omit<typeof serverTable.$inferInsert, 'id'>
export type ServerUpdate = Partial<typeof serverTable.$inferUpdate>

export function createServer(data: ServerInsert) {
  const db = getDb()
  return db.insert(serverTable).values(data).returning()
}

export function getServers() {
  const db = getDb()
  return db.select().from(serverTable).orderBy(desc(serverTable.createdTime)).all()
}

export function getServerById(id: number) {
  const db = getDb()
  return db.select().from(serverTable).where(eq(serverTable.id, id)).get()
}

export function updateServer(id: number, data: ServerUpdate) {
  const db = getDb()
  return db.update(serverTable).set(data).where(eq(serverTable.id, id)).returning()
}

export function deleteServer(id: number) {
  const db = getDb()
  return db.delete(serverTable).where(eq(serverTable.id, id)).returning()
}

export function registerServerHandlers() {
  ipcMain.handle('server:create', async (_, data) => {
    try { return await createServer(data) } catch (e) { console.error('创建服务器失败:', e); throw e }
  })
  ipcMain.handle('server:getAll', async () => {
    try { return await getServers() } catch (e) { console.error('获取服务器列表失败:', e); throw e }
  })
  ipcMain.handle('server:getById', async (_, id) => {
    try { return await getServerById(id) } catch (e) { console.error('获取服务器失败:', e); throw e }
  })
  ipcMain.handle('server:update', async (_, id, data) => {
    try { return await updateServer(id, data) } catch (e) { console.error('更新服务器失败:', e); throw e }
  })
  ipcMain.handle('server:delete', async (_, id) => {
    try { return await deleteServer(id) } catch (e) { console.error('删除服务器失败:', e); throw e }
  })
}


