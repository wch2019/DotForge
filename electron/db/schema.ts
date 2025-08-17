import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import {sql} from "drizzle-orm";

export const project = sqliteTable('project', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdTime: text('createdTime').default(sql`datetime('now')`),
    name: text('name').notNull(),
    localPath: text('localPath').notNull(),
    description: text('description'),
    tag: text('tag'),
    buildCmd: text('buildCmd'),
    outputDir: text('outputDir'),
    deployMethod: text('deployMethod'), // 'none'|'local'|'docker'|'remote'
    localCommand: text('localCommand'),
    dockerfilePath: text('dockerfilePath'),
    imageName: text('imageName'),
    registry: text('registry'),
    dockerDeployType: text('dockerDeployType'), // 'local'|'push'
    dockerRunCommand: text('dockerRunCommand'),
    serverAddress: text('serverAddress'),
    serverPort: integer('serverPort'),
    serverUsername: text('serverUsername'),
    authType: text('authType'), // 'password'|'privateKey'
    serverPassword: text('serverPassword'),
    privateKeyPath: text('privateKeyPath'),
    targetPath: text('targetPath'),
    remoteCommand: text('remoteCommand'),
    keepArtifacts: integer('keepArtifacts'), // 0 or 1
    keepPath: text('keepPath'),
    keepCount: integer('keepCount'),
    lastBuildTime: text('lastBuildTime'),
    status: text('status')
})

export const projectBuild = sqliteTable("project_build", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("projectId").notNull(),
    projectName: text("projectName").notNull(),
    command: text("command").notNull(),
    localPath: text("localPath"),
    status: text("status").notNull(),
    artifactPath: text("artifactPath"),
    artifactSize: integer("artifactSize"),
    logs: text("logs"),
    startTime: text("startTime").default(sql`datetime('now')`),
    endTime: text("endTime"),
});
