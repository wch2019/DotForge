export interface BuildLog {
    /** 日志ID */
    id?: number
    /** 项目ID */
    projectId: string
    /** 项目名称 */
    projectName: string
    /** 构建命令 */
    command?: string
    /** 项目路径 */
    localPath?: string
    /** 构建状态 */
    status: 'building' | 'success' | 'failed'
    /** 构建开始时间 */
    startTime?: string
    /** 构建结束时间 */
    endTime?: string
    /** 构建产物路径 */
    artifactsPath?: string
    /** 构建产物大小 */
    artifactSize?: number
    /** 构建日志内容 */
    logs: string
}

export interface BuildLogFilter {
    /** 状态筛选 */
    status?: 'building' | 'success' | 'failed'
    /** 时间范围 */
    dateRange?: [number, number]
    /** 关键词搜索 */
    keyword?: string
}

export interface BuildLogStats {
    /** 总构建次数 */
    totalBuilds: number
    /** 成功构建次数 */
    successBuilds: number
    /** 失败构建次数 */
    failedBuilds: number
    /** 构建中次数 */
    buildingBuilds: number
    /** 平均构建时长（毫秒） */
    averageBuildTime: number
    /** 最近构建时间 */
    lastBuildTime?: number
} 