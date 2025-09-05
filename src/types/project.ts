export interface ProjectData {
    /** 项目ID **/
    id?: number
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
    /** 远程服务器ID **/
    serverId?: number
    /** 远程目录 **/
    remoteDirectory: string
    /** 删除前缀 **/
    removePrefix: string
    /** 源文件 **/
    sourceFiles: string
    /** 远程命令 **/
    remoteCommand: string

    /** 是否保留构建产物 **/
    keepArtifacts: number
    /** 保留路径 **/
    keepPath: string
    /** 删除策略 **/
    keepCount: number
    /** 项目状态 **/
    status?: string
    /** 最近构建 **/
    lastBuildTime?: string
}


export const defaultProjectData: ProjectData = {
    name: '',
    localPath: '',
    description: '',
    tag: 'java',
    buildCmd: '',
    outputDir: '',
    deployMethod: 'none',
    dockerfilePath: './Dockerfile',
    imageName: '',
    registry: '',
    localCommand: '',
    dockerDeployType: 'local',
    dockerRunCommand: '',
    remoteDirectory: '',
    removePrefix: '',
    sourceFiles: '',
    remoteCommand: '',
    keepArtifacts: 0,
    keepPath: '',
    keepCount: 10,
    status: '',
    lastBuildTime: ''
}

// 发布方式选项
export const deployMethods = [
    {label: '不发布', value: 'none'},
    {label: '本地命令', value: 'local'},
    {label: '远程服务器', value: 'remote'},
    // {label: 'Docker镜像', value: 'docker'},
]
// 项目标签
export const tags = [
    {label: 'Java', value: 'java'},
    {label: 'Node', value: 'node'},
    {label: 'Python', value: 'python'},
    {label: 'Go', value: 'go'},
]

// 构建状态
export const enum BuildStatus {
    // 正在构建
    BUILDING = 'building',
    // 构建完成
    SUCCESS = 'success',
    // 构建失败
    FAILED = 'failed',
}

