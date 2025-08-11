import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const projects = sqliteTable('projects', {
    id: integer('id').primaryKey({ autoIncrement: true }),
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
})
