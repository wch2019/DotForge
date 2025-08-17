import {ipcMain} from 'electron';
import {project} from "../db/schema.ts";
import {getDb} from "../db";
import {eq} from "drizzle-orm";

export function createProject(data: Omit<typeof project.$inferInsert, 'id'>) {
    console.log('createProject', data);
    const db = getDb();
    return db.insert(project).values(data).returning();
}

export function getProject() {
    const db = getDb();
    return db.select().from(project).all();
}

export function getProjectById(id: number) {
    const db = getDb();
    return db.select().from(project).where(eq(project.id, id)).get();
}

export function updateProject(id: number, data: Partial<typeof project.$inferUpdate>) {
    const db = getDb();
    return db.update(project).set(data).where(eq(project.id, id)).returning();
}

export function deleteProject(id: number) {
    const db = getDb();
    return db.delete(project).where(eq(project.id, id)).returning();
}

// 注册所有 project 相关 IPC
export function registerProjectHandlers() {
    // 创建项目
    ipcMain.handle('project:create', async (_, projectData) => {
        try {
            return await createProject(projectData);
        } catch (error) {
            console.error('创建项目失败:', error);
            throw error;
        }
    });

    // 获取项目列表
    ipcMain.handle('project:getAll', async () => {
        try {
            return await getProject();
        } catch (error) {
            console.error('获取项目列表失败:', error);
            throw error;
        }
    });

    // 获取项目
    ipcMain.handle('project:getById', async (_, id) => {
        try {
            return await getProjectById(id);
        } catch (error) {
            console.error('获取项目失败:', error);
            throw error;
        }
    });

    // 更新项目
    ipcMain.handle('project:update', async (_, id, projectData) => {
        try {
            return await updateProject(id, projectData);
        } catch (error) {
            console.error('更新项目失败:', error);
            throw error;
        }
    });

    // 删除项目
    ipcMain.handle('project:delete', async (_, id) => {
        try {
            return await deleteProject(id);
        } catch (error) {
            console.error('删除项目失败:', error);
            throw error;
        }
    });
}
