import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import {sql} from "drizzle-orm";

export const project = sqliteTable('project', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdTime: text('createdTime').default(sql`strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')`),
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
    serverId: text('serverId'),
    remoteDirectory: text('remoteDirectory'),
    removePrefix: text('removePrefix'),
    sourceFiles: text('sourceFiles'),
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
    startTime: text("startTime").default(sql`strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')`),
    endTime: text("endTime"),
});

export const server = sqliteTable('server', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    createdTime: text('createdTime').default(sql`strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')`),
    name: text('name').notNull(),
    tag: text('tag'),
    host: text('host').notNull(),
    port: integer('port').default(22),
    username: text('username').notNull(),
    authType: text('authType'), // 'password' | 'privateKey'
    password: text('password'),
    privateKeyPath: text('privateKeyPath'),
    description: text('description'),
});
