// import db from './database'
// import {ProjectData} from './types/project'
// import {ipcMain} from 'electron'
//
// export function addProject(project: ProjectData) {
//     const stmt = db.prepare(`
//         INSERT INTO projects (name, localPath, description, tag,
//                               buildCmd, outputDir,
//                               deployMethod, dockerfilePath, imageName, registry, localCommand,
//                               dockerDeployType, dockerRunCommand,
//                               serverAddress, serverPort, serverUsername, authType, serverPassword,
//                               privateKeyPath, targetPath, remoteCommand,
//                               keepArtifacts, keepPath, keepCount)
//         VALUES (@name, @localPath, @description, @tag,
//                 @buildCmd, @outputDir,
//                 @deployMethod, @dockerfilePath, @imageName, @registry, @localCommand,
//                 @dockerDeployType, @dockerRunCommand,
//                 @serverAddress, @serverPort, @serverUsername, @authType, @serverPassword,
//                 @privateKeyPath, @targetPath, @remoteCommand,
//                 @keepArtifacts, @keepPath, @keepCount)
//     `)
//
//     stmt.run({
//         ...project,
//         keepArtifacts: project.keepArtifacts ? 1 : 0
//     })
// }
//
// export function getAllProjects(): ProjectData[] {
//     const stmt = db.prepare(`SELECT * FROM projects`)
//     return stmt.all()
// }
//
// export function registerProjectHandlers() {
//     ipcMain.handle('project:add', (_e, projectData) => {
//         addProject(projectData)
//         return true
//     })
//
//     ipcMain.handle('project:list', () => {
//         return getAllProjects()
//     })
// }
