import { reactive, ref } from 'vue'

// 声明全局类型
declare global {
  interface Window {
    dataAPI: {
      read: (filename: string) => Promise<any>
      write: (filename: string, data: any) => Promise<boolean>
      getDataDir: () => Promise<string>
      setDataDir: (newDir: string) => Promise<boolean>
    }
  }
}

// 项目接口
export interface Project {
  id: string
  name: string
  localPath: string
  buildCmd: string
  outputDir: string
  deployMethod: 'none' | 'local' | 'docker' | 'remote'
  dockerfilePath: string
  imageName: string
  localCommand: string
  dockerDeployType: 'local' | 'push'
  dockerRunCommand: string
  serverAddress: string
  serverPort: number
  serverUsername: string
  authType: 'password' | 'privateKey'
  serverPassword: string
  privateKeyPath: string
  targetPath: string
  remoteCommand: string
  keepArtifacts: boolean
  keepPath: string
  keepCount: number
  status: 'idle' | 'building' | 'success' | 'failed'
  createdAt: number
  updatedAt: number
}

// 构建日志接口
export interface BuildLog {
  id: string
  projectId: string
  projectName: string
  status: 'building' | 'success' | 'failed'
  logs: string[]
  startTime: number
  endTime?: number
  createdAt: number
}

// 环境配置接口
export interface EnvironmentConfig {
  nodePath: string
  javaPath: string
  mavenPath: string
  dockerPath: string
  gitPath: string
}

// 应用设置接口
export interface AppSettings {
  dataDir: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoSave: boolean
  buildTimeout: number
  maxConcurrentBuilds: number
}

// 数据文件名常量
const DATA_FILES = {
  PROJECTS: 'projects.json',
  BUILD_LOGS: 'build-logs.json',
  SETTINGS: 'settings.json',
  ENVIRONMENT: 'environment.json'
} as const

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  dataDir: '',
  theme: 'auto',
  language: 'zh-CN',
  autoSave: true,
  buildTimeout: 30,
  maxConcurrentBuilds: 3
}

// 默认环境配置
const DEFAULT_ENVIRONMENT: EnvironmentConfig = {
  nodePath: '',
  javaPath: '',
  mavenPath: '',
  dockerPath: '',
  gitPath: ''
}

class DataStore {
  private projects = reactive<Project[]>([])
  private buildLogs = reactive<BuildLog[]>([])
  private settings = reactive<AppSettings>({ ...DEFAULT_SETTINGS })
  private environment = reactive<EnvironmentConfig>({ ...DEFAULT_ENVIRONMENT })
  private isInitialized = ref(false)

  // 初始化数据存储
  async init() {
    if (this.isInitialized.value) return

    try {
      // 加载设置
      await this.loadSettings()
      
      // 加载环境配置
      await this.loadEnvironment()
      
      // 加载项目数据
      await this.loadProjects()
      
      // 加载构建日志
      await this.loadBuildLogs()
      
      this.isInitialized.value = true
      console.log('数据存储初始化完成')
    } catch (error) {
      console.error('数据存储初始化失败:', error)
    }
  }

  // 加载设置
  async loadSettings() {
    try {
      const data = await window.dataAPI.read(DATA_FILES.SETTINGS)
      if (data) {
        Object.assign(this.settings, data)
      } else {
        // 如果没有设置文件，使用默认设置
        this.settings.dataDir = await window.dataAPI.getDataDir()
        await this.saveSettings()
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  // 保存设置
  async saveSettings() {
    try {
      const success = await window.dataAPI.write(DATA_FILES.SETTINGS, this.settings)
      if (success) {
        console.log('设置保存成功')
      } else {
        console.error('设置保存失败')
      }
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }

  // 加载环境配置
  async loadEnvironment() {
    try {
      const data = await window.dataAPI.read(DATA_FILES.ENVIRONMENT)
      if (data) {
        Object.assign(this.environment, data)
      } else {
        // 如果没有环境配置文件，创建默认文件
        await this.saveEnvironment()
      }
    } catch (error) {
      console.error('加载环境配置失败:', error)
    }
  }

  // 保存环境配置
  async saveEnvironment() {
    try {
      const success = await window.dataAPI.write(DATA_FILES.ENVIRONMENT, this.environment)
      if (success) {
        console.log('环境配置保存成功')
      } else {
        console.error('环境配置保存失败')
      }
    } catch (error) {
      console.error('保存环境配置失败:', error)
    }
  }

  // 加载项目数据
  async loadProjects() {
    try {
      const data = await window.dataAPI.read(DATA_FILES.PROJECTS)
      if (data && Array.isArray(data)) {
        this.projects.splice(0, this.projects.length, ...data)
      }
    } catch (error) {
      console.error('加载项目数据失败:', error)
    }
  }

  // 保存项目数据
  async saveProjects() {
    try {
      const success = await window.dataAPI.write(DATA_FILES.PROJECTS, this.projects)
      if (success) {
        console.log('项目数据保存成功')
      } else {
        console.error('项目数据保存失败')
      }
    } catch (error) {
      console.error('保存项目数据失败:', error)
    }
  }

  // 加载构建日志
  async loadBuildLogs() {
    try {
      const data = await window.dataAPI.read(DATA_FILES.BUILD_LOGS)
      if (data && Array.isArray(data)) {
        this.buildLogs.splice(0, this.buildLogs.length, ...data)
      }
    } catch (error) {
      console.error('加载构建日志失败:', error)
    }
  }

  // 保存构建日志
  async saveBuildLogs() {
    try {
      const success = await window.dataAPI.write(DATA_FILES.BUILD_LOGS, this.buildLogs)
      if (success) {
        console.log('构建日志保存成功')
      } else {
        console.error('构建日志保存失败')
      }
    } catch (error) {
      console.error('保存构建日志失败:', error)
    }
  }

  // 项目相关方法
  getProjects(): Project[] {
    return this.projects
  }

  async addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    this.projects.push(newProject)
    await this.saveProjects()
    return newProject.id
  }

  async updateProject(id: string, data: Partial<Project>): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id)
    if (index === -1) return false

    this.projects[index] = {
      ...this.projects[index],
      ...data,
      updatedAt: Date.now()
    }
    
    await this.saveProjects()
    return true
  }

  async removeProject(id: string): Promise<boolean> {
    const index = this.projects.findIndex(p => p.id === id)
    if (index === -1) return false

    this.projects.splice(index, 1)
    await this.saveProjects()
    return true
  }

  getProject(id: string): Project | undefined {
    return this.projects.find(p => p.id === id)
  }

  // 构建日志相关方法
  getBuildLogs(projectId?: string): BuildLog[] {
    if (projectId) {
      return this.buildLogs.filter(log => log.projectId === projectId)
    }
    return this.buildLogs
  }

  async addBuildLog(log: Omit<BuildLog, 'id' | 'createdAt'>): Promise<string> {
    const newLog: BuildLog = {
      ...log,
      id: Date.now().toString(),
      createdAt: Date.now()
    }
    
    this.buildLogs.push(newLog)
    await this.saveBuildLogs()
    return newLog.id
  }

  async updateBuildLog(id: string, data: Partial<BuildLog>): Promise<boolean> {
    const index = this.buildLogs.findIndex(log => log.id === id)
    if (index === -1) return false

    this.buildLogs[index] = {
      ...this.buildLogs[index],
      ...data
    }
    
    await this.saveBuildLogs()
    return true
  }

  async removeBuildLog(id: string): Promise<boolean> {
    const index = this.buildLogs.findIndex(log => log.id === id)
    if (index === -1) return false

    this.buildLogs.splice(index, 1)
    await this.saveBuildLogs()
    return true
  }

  getBuildLog(id: string): BuildLog | undefined {
    return this.buildLogs.find(log => log.id === id)
  }

  // 环境配置相关方法
  getEnvironment(): EnvironmentConfig {
    return { ...this.environment }
  }

  async updateEnvironment(newConfig: Partial<EnvironmentConfig>): Promise<boolean> {
    Object.assign(this.environment, newConfig)
    await this.saveEnvironment()
    return true
  }

  // 设置相关方法
  getSettings(): AppSettings {
    return { ...this.settings }
  }

  async updateSettings(newSettings: Partial<AppSettings>): Promise<boolean> {
    Object.assign(this.settings, newSettings)
    await this.saveSettings()
    return true
  }

  async setDataDir(newDir: string): Promise<boolean> {
    const success = await window.dataAPI.setDataDir(newDir)
    if (success) {
      this.settings.dataDir = newDir
      await this.saveSettings()
    }
    return success
  }

  // 获取数据目录
  async getDataDir(): Promise<string> {
    return await window.dataAPI.getDataDir()
  }

  // 检查是否已初始化
  isReady(): boolean {
    return this.isInitialized.value
  }
}

// 创建单例实例
const dataStore = new DataStore()

export default dataStore 