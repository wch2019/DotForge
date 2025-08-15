export interface BuildLog {
  /** 日志ID */
  id: number
  /** 项目ID */
  projectId: string
  /** 项目名称 */
  projectName: string
  /** 构建状态 */
  status: 'building' | 'success' | 'failed'
  /** 构建开始时间 */
  startTime: number
  /** 构建结束时间 */
  endTime?: number
  /** 构建日志内容 */
  logs: string[]
  /** 构建命令 */
  buildCommand?: string
  /** 构建输出目录 */
  outputDir?: string
  /** 错误信息 */
  errorMessage?: string
  /** 构建产物路径 */
  artifactsPath?: string
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