import {ipcMain} from 'electron';
import {projectBuild} from "../db/schema.ts";
import {getDb} from "../db";
import {desc, eq} from "drizzle-orm";

export function createProjectBuild(data: Omit<typeof projectBuild.$inferInsert, 'id'>) {
    const db = getDb();
    return db.insert(projectBuild).values(data).returning();
}

export function getProjectBuild(projectId?: string) {
    const db = getDb();
    const query = db
        .select({
            id: projectBuild.id,
            status: projectBuild.status,
            startTime: projectBuild.startTime,
            endTime: projectBuild.endTime
        })
        .from(projectBuild);

    if (projectId) {
        return query.where(eq(projectBuild.projectId, projectId)).all();
    }

    return query.orderBy(desc(projectBuild.startTime)).all();
}

export function getProjectBuildById(id: number) {
    const db = getDb();
    return db.select().from(projectBuild).where(eq(projectBuild.id, id)).get();
}

export function updateProjectBuild(id: number, data: Partial<typeof projectBuild.$inferUpdate>) {
    const db = getDb();
    return db.update(projectBuild).set(data).where(eq(projectBuild.id, id)).returning();
}

export function deleteProjectBuild(id: number) {
    const db = getDb();
    return db.delete(projectBuild).where(eq(projectBuild.id, id)).returning();
}

// 注册所有 projectBuild 相关 IPC
export function registerProjectBuildHandlers() {
    // 创建项目日志
    ipcMain.handle('build:create', async (_, projectBuildData) => {
        try {
            return await createProjectBuild(projectBuildData);
        } catch (error) {
            console.error('创建项目日志失败:', error);
            throw error;
        }
    });

    // 获取项目日志列表
    ipcMain.handle('build:getAll', async (_,projectId) => {
        try {
            return await getProjectBuild(projectId);
        } catch (error) {
            console.error('获取项目日志列表失败:', error);
            throw error;
        }
    });

    // 获取项目日志
    ipcMain.handle('build:getById', async (_, id) => {
        try {
            return await getProjectBuildById(id);
        } catch (error) {
            console.error('获取项目日志失败:', error);
            throw error;
        }
    });

    // 更新项目日志
    ipcMain.handle('build:update', async (_, id, projectBuildData) => {
        try {
            return await updateProjectBuild(id, projectBuildData);
        } catch (error) {
            console.error('更新项目日志失败:', error);
            throw error;
        }
    });

    // 删除项目日志
    ipcMain.handle('build:delete', async (_, id) => {
        try {
            return await deleteProjectBuild(id);
        } catch (error) {
            console.error('删除项目日志失败:', error);
            throw error;
        }
    });
}
