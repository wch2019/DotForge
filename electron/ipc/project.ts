import { ipcMain } from 'electron';
import { createProject, updateProject } from '../db';

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

  // 更新项目
  ipcMain.handle('project:update', async (_, id, projectData) => {
    try {
      return await updateProject(id, projectData);
    } catch (error) {
      console.error('更新项目失败:', error);
      throw error;
    }
  });
}
