export interface ProjectData {
    /** 项目名称 **/
    name: string
    /** 项目路径 **/
    localPath: string
    /** 项目描述 **/
    description: string
    /** 项目标签 **/
    tag: string

    /** 构建命令 **/
    buildCmd: string
    /** 构建输出目录 **/
    outputDir: string

    /** 部署方式 **/
    deployMethod: 'none' | 'local' | 'docker' | 'remote'
    /** 本地部署命令 **/
    localCommand: string
    /** Dockerfile 路径 **/
    dockerfilePath: string
    /** 镜像名称 **/
    imageName: string
    /** 镜像仓库 **/
    registry: string
    /** Docker 部署方式 **/
    dockerDeployType: 'local' | 'push'
    /** Docker 运行命令 **/
    dockerRunCommand: string
    /** 服务器信息 **/
    serverAddress: string
    /** 服务器端口 **/
    serverPort: number
    /** 服务器用户名 **/
    serverUsername: string
    /** 认证方式 **/
    authType: 'password' | 'privateKey'
    /** 密码 **/
    serverPassword: string
    /** 私钥路径 **/
    privateKeyPath: string
    /** 目标路径 **/
    targetPath: string
    /** 远程命令 **/
    remoteCommand: string

    /** 是否保留构建产物 **/
    keepArtifacts: number
    /** 保留路径 **/
    keepPath: string
    /** 删除策略 **/
    keepCount: number
}


export const defaultProjectData: ProjectData = {
    name: '',
    localPath: '',
    description: '',
    tag: 'java',
    buildCmd: 'mvn clean package',
    outputDir: '',
    deployMethod: 'none',
    dockerfilePath: './Dockerfile',
    imageName: '',
    registry: '',
    localCommand: '',
    dockerDeployType: 'local',
    dockerRunCommand: '',
    serverAddress: '',
    serverPort: 22,
    serverUsername: '',
    authType: 'password',
    serverPassword: '',
    privateKeyPath: '',
    targetPath: '',
    remoteCommand: '',
    keepArtifacts: 0,
    keepPath: '',
    keepCount: 10
}
