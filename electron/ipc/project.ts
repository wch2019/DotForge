import {ipcMain} from 'electron';
import {createProject, updateProject, getProjects, getProjectById, deleteProject} from '../db/crud.ts';

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
            return await getProjects();
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
