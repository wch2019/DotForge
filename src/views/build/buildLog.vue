<template>
  <div class="build-log-page">
    <div class="build-log-container">
      <!-- Top Header -->
      <div class="build-log-header">
        <div class="header-left">
          <n-button quaternary circle size="large" @click="goBack" class="back-btn">
            <template #icon>
              <n-icon>
                <ArrowBackOutline/>
              </n-icon>
            </template>
          </n-button>
          <div class="header-info">
            <h1 class="project-title">
              {{ action === 'view' ? '查看构建日志' : projectName + ' 构建日志' }}
            </h1>
            <p class="build-status" :class="buildStatusClass">
              <n-icon size="16" class="status-icon">
                <CheckmarkCircleOutline v-if="buildStatus === 'success'"/>
                <CloseCircleOutline v-else-if="buildStatus === 'failed'"/>
                <SyncOutline v-else class="spinning"/>
              </n-icon>
              {{ buildStatusText }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <n-switch v-model:value="scroll">
            <template #checked>
              自动滚动
            </template>
            <template #unchecked>
              不滚动
            </template>
          </n-switch>
          <n-button quaternary size="small" @click="clearLogs" :disabled="!logs.length || action === 'view'">
            <template #icon>
              <n-icon>
                <TrashOutline/>
              </n-icon>
            </template>
            清除日志
          </n-button>
          <n-button quaternary size="small" @click="exportLogs" :disabled="!logs.length">
            <template #icon>
              <n-icon>
                <DownloadOutline/>
              </n-icon>
            </template>
            导出日志
          </n-button>
          <n-button v-if="action != 'view'" type="error" size="small" @click="stopBuild"
                    :disabled="buildStatus !== 'building'">
            <template #icon>
              <n-icon>
                <StopOutline/>
              </n-icon>
            </template>
            停止构建
          </n-button>
        </div>
      </div>

      <!-- Log Content Area -->
      <div class="log-container">
        <div class="log-content" ref="logContent">
          <div v-if="logs.length === 0" class="empty-logs">
            <n-icon size="48" class="empty-icon">
              <DocumentTextOutline/>
            </n-icon>
            <p class="empty-text">暂无构建日志</p>
          </div>
          <div v-else class="log-lines">
            <div v-for="(line, index) in logs" :key="index" class="log-line" :class="getLogLineClass(line)">
              <span class="line-number">{{ index + 1 }}</span>
              <span class="line-content" v-html="formatLogLine(line)"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref, toRaw} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {NButton, NIcon, useMessage} from 'naive-ui'
import {
  ArrowBackOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  DocumentTextOutline,
  DownloadOutline,
  StopOutline,
  SyncOutline,
  TrashOutline
} from '@vicons/ionicons5'
import {BuildStatus, defaultProjectData} from "@/types/project.ts";
import {BuildLog} from "@/types/buildLog.ts";
import {formatDateTime} from "@/utils/date.ts";
import {AnsiUp} from "ansi_up";
import {ServerForm} from "@/types/server.ts";

const buildLog = ref<BuildLog>({
  projectId: '',
  projectName: '',
  status: 'building',
  logs: ''
})

const router = useRouter()
const route = useRoute()
const message = useMessage()
const logContent = ref<HTMLElement>()

const projectId = computed(() => route.query.id as string)
const projectName = ref(route.query.name as string || 'MyApp')
const logId = computed(() => route.query.logId as string)
const action = computed(() => route.query.action as string)
const buildStatus = ref<'building' | 'success' | 'failed'>('building')
const logs = ref<string[]>([])
const project = ref({...defaultProjectData});

const buildStatusText = computed(() => {
  switch (buildStatus.value) {
    case 'building':
      return '构建中...'
    case 'success':
      return '构建成功'
    case 'failed':
      return '构建失败'
    default:
      return '未知状态'
  }
})

const buildStatusClass = computed(() => {
  switch (buildStatus.value) {
    case 'building':
      return 'status-building'
    case 'success':
      return 'status-success'
    case 'failed':
      return 'status-failed'
    default:
      return ''
  }
})
const scroll = ref(true)
const server = ref<ServerForm>({
  name: '',
  host: '',
  port: 22,
  username: '',
  authType: 'password',
  password: '',
  privateKeyPath: ''
})

const info = ref("\x1b[32m[INFO]\x1b[0m ")
const error = ref("\x1b[31m[ERROR]\x1b[0m ")
const warn = ref("\x1b[33m[WARN]\x1b[0m ")

const buildSteps = [
  info.value + '开始构建项目...',
  info.value + '获取基础信息...',
  info.value + '执行构建流程...',
  info.value + '执行发布操作...',
  info.value + '执行其他配置...',
  info.value + '构建成功完成'
]
const ansi_up = new AnsiUp();

// 片段颜色
function formatLogLine(line: string) {
  return ansi_up.ansi_to_html(line);
}

// 获取日志行样式
function getLogLineClass(line: string) {
  if (line.includes('ERROR') || line.includes('FAILED')) return 'log-line-error'
  if (line.includes('WARNING')) return 'log-line-warning'
  if (line.includes('SUCCESS') || line.includes('SUCCEEDED')) return 'log-line-success'
  return ''
}

// 返回
function goBack() {
  router.back()
}

onMounted(async () => {
  if (projectId.value) {
    // 加载项目信息
    await getProjectInfo()

    // 加载最新的构建日志
    if (action.value === 'view' && logId.value) {
      // 查看历史构建日志
      await loadHistoryLog()
    }
    // 运行构建
    if (action.value === 'build') {
      buildStatus.value = 'building'
      await runBuild()
    }

    scrollToBottom()
  }

})

// 停止构建
function stopBuild() {
  window.electronAPI.stopCommand().then((stopped: any) => {
    if (stopped) {
      logs.value.push(info.value + '构建已停止')
      buildStatus.value = BuildStatus.FAILED
    } else {
      logs.value.push('[WARN] 没有正在运行的构建任务')
    }
  })
  // 保存构建日志
  saveBuildLog()
}

// 滚动到底部
function scrollToBottom() {
  if (!scroll.value) return
  nextTick(() => {
    if (logContent.value) {
      logContent.value.scrollTop = logContent.value.scrollHeight
    }
  })
}

// 保存构建日志
async function saveBuildLog() {
  if (!buildLog.value.id) {
    buildLog.value.projectId = projectId.value
    buildLog.value.projectName = projectName.value
    buildLog.value.command = project.value.buildCmd
    buildLog.value.localPath = project.value.localPath
    buildLog.value.status = buildStatus.value
    let newBuildLog = await window.electronAPI.createBuildLog(toRaw(buildLog.value))
    buildLog.value = newBuildLog[0]
    return
  } else {
    buildLog.value.status = buildStatus.value
    buildLog.value.endTime = buildStatus.value !== BuildStatus.BUILDING ? formatDateTime(Date.now()) : undefined
    buildLog.value.logs = JSON.stringify(logs.value)
    await window.electronAPI.updateBuildLog(buildLog.value.id, toRaw(buildLog.value))
  }
  if (buildStatus.value !== BuildStatus.BUILDING) {
    await window.electronAPI.updateProject(parseInt(projectId.value), {
      lastBuildTime: buildLog.value.startTime,
      status: buildLog.value.status
    });
  }
}

// 开始构建
async function runBuild() {
  if (!projectId.value) return
  buildStatus.value = BuildStatus.BUILDING
  await saveBuildLog()
  await stepLog(buildSteps[0])
  await stepLog(buildSteps[1])
  const localPath = project.value.localPath
  await stepLog(info.value + localPath)
  await stepLog(buildSteps[2])
  // 构建流程
  // const method = await buildMethod(project.value.buildCmd, localPath)
  // if (!method) {
  //   buildStatus.value = BuildStatus.FAILED
  //   await saveBuildLog()
  //   return
  // }
  // 发布操作
  const deploy = await deployMethod(project)
  if (!deploy) {
    buildStatus.value = BuildStatus.FAILED
    await saveBuildLog()
    return
  }
  // 其他操作
  await otherConfig()
  buildStatus.value = BuildStatus.SUCCESS
  logs.value.push(buildSteps[5])
  await saveBuildLog()
}

// 构建流程
async function buildMethod(buildCmd: string, localPath: string) {
  // 按换行分割命令
  const commands = buildCmd
      .split(/\r?\n/) // 按换行符切割
      .map(cmd => cmd.trim()) // 去掉首尾空格
      .filter(cmd => cmd.length > 0) // 过滤空行

  // 逐行执行命令
  for (const cmd of commands) {
    logs.value.push(info.value + `执行命令: ${cmd}`)
    const code = await window.electronAPI.runCommand(cmd, {cwd: localPath})
    if (code !== 0) {
      logs.value.push(error.value + `命令失败: ${cmd}`)
      return false
    }
  }
  return true
}

// 发布操作
async function deployMethod(project: any) {
  await stepLog(buildSteps[3])
  if (project.value.deployMethod == 'none') {
    await stepLog("不发布")
  }
  if (project.value.deployMethod == 'local') {
    await stepLog("本地部署")
    return await buildMethod(project.value.localCommand, project.value.localPath)
  }
  if (project.value.deployMethod == 'remote') {
    await stepLog("远程服务器")
    return await serverRemote(project)
  }
  return true
}
// 远程服务器
async function serverRemote(project: any) {
  const data = await window.electronAPI.server.getServerById(project.value.serverId)
  if (!data) {
    logs.value.push(error.value + '未找到服务器配置')
    return false
  }
  Object.assign(server.value, data)
  logs.value.push(info.value + `服务器: ${server.value.name} (${server.value.host}:${server.value.port})`)

  // 连接 SSH
  try {
    logs.value.push(info.value + '连接中...')
    const connectionId = await window.electronAPI.connectSSH({
      host: server.value.host,
      port: Number(server.value.port) || 22,
      username: server.value.username,
      password: server.value.authType === 'password' ? server.value.password : undefined,
      privateKeyPath: server.value.authType === 'privateKey' ? server.value.privateKeyPath : undefined,
    })

    if (!connectionId) {
      logs.value.push(error.value + '连接失败')
      return false
    }
    logs.value.push(info.value + '连接成功')

    try {
      // 上传目录
      const localDir = joinPaths(project.value.localPath, project.value.outputDir)
      const remoteDir = String(project.value.remoteDirectory || '').trim()
      if (!remoteDir) {
        logs.value.push(error.value + '远程目录未配置')
        await window.electronAPI.disconnectSSH(connectionId)
        return false
      }

      logs.value.push(info.value + `开始上传: ${localDir} -> ${remoteDir}`)
      await window.electronAPI.uploadDir(connectionId, localDir, remoteDir)
      logs.value.push(info.value + '上传完成')

      // 执行远程命令（可选）
      const remoteCmd = String(project.value.remoteCommand || '').trim()
      if (remoteCmd) {
        logs.value.push(info.value + '开始执行命令...')
        const output = await window.electronAPI.executeSSHCommand(connectionId, remoteCmd)
        if (output) {
          for (const line of output.split(/\r?\n/)) {
            if (line) logs.value.push(line)
          }
        }
        logs.value.push(info.value + '命令执行完成')
      } else {
        logs.value.push(warn.value + '未配置远程命令，跳过执行')
      }

      await window.electronAPI.disconnectSSH(connectionId)
      return true
    } catch (e) {
      logs.value.push(error.value + '远程部署失败: ' + (e as Error).message)
      try { await window.electronAPI.disconnectSSH(connectionId) } catch {}
      return false
    }
  } catch (e) {
    logs.value.push(error.value + '连接服务器失败: ' + (e as Error).message)
    return false
  }
}

// 其他配置
async function otherConfig() {
  logs.value.push(buildSteps[4])
}

function joinPaths(...paths: string[]) {
  return paths
      .map(path => String(path).replace(/[\\/]+$/, ''))
      .filter(Boolean)
      .join('/')
      .replace(/\/\//g, '/');
}

// 步骤日志
async function stepLog(message: string, delayMs = 500) {
  logs.value.push(message)
  await saveBuildLog()
  await new Promise(resolve => setTimeout(resolve, delayMs))
}


window.electronAPI.onCommandOutput((line: string) => {
  console.log('命令输出:', line)
  logs.value.push(line)
  scrollToBottom()
})

// 加载历史构建日志
async function loadHistoryLog() {
  if (!logId.value) return

  try {
    const buildLogs = await window.electronAPI.getBuildLogById(Number(logId.value))
    if (buildLogs) {
      logs.value = JSON.parse(buildLogs.logs)
      buildStatus.value = buildLogs.status
    } else {
      logs.value.push('[WARN] 未找到指定的构建日志')
    }
  } catch (error) {
    console.error('加载历史构建日志失败:', error)
    logs.value.push('[ERROR] 加载历史构建日志失败')
  }
}

// 获取项目信息
async function getProjectInfo() {
  const projectInfo = await window.electronAPI.getProjectById(Number(projectId.value))
  if (projectInfo) {
    Object.assign(project.value, projectInfo)
  }
}


// 清空日志
async function clearLogs() {
  await saveBuildLog()
  logs.value = []
}

// 导出日志
function exportLogs() {
  if (logs.value.length === 0) return

  const logText = logs.value.join('\n')
  const blob = new Blob([logText], {type: 'text/plain'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName.value}-build-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  message.success('日志导出成功')
}

</script>

<style scoped>
.build-log-page {
  background: #f5f7fa;
  height: var(--content-height);
  padding: 16px;
}

.build-log-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.build-log-header {
  padding: 8px 24px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.project-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.build-status {
  font-size: 14px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-building {
  color: #f59e0b;
}

.status-success {
  color: #22c55e;
}

.status-failed {
  color: #ef4444;
}

.status-icon {
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;
}

.log-container {
  height: calc(100vh - 150px);
  overflow: hidden;
}

.log-content {
  height: 100%;
  overflow-y: auto;
  padding: 16px 24px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  background: #1e1e1e;
  color: #d4d4d4;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.empty-icon {
  color: #4b5563;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  margin: 0;
}

.log-lines {
  display: flex;
  flex-direction: column;
  overflow-x: auto; /* 横向滚动 */
  white-space: nowrap; /* 不换行，超出时出现横向滚动条 */
}

.log-line {
  display: flex;
  gap: 12px;
  padding: 2px 0;
  transition: background-color 0.1s ease;
}

.log-line:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.line-number {
  color: #6b7280;
  font-size: 12px;
  min-width: 40px;
  text-align: right;
  user-select: none;
  flex: 0 0 auto;
}

.line-content {
  flex: 0 0 auto; /* 不压缩内容 */
  word-break: keep-all; /* 保留单词，避免自动断行 */
  white-space: pre; /* 保留空格和换行格式 */
  font-family: monospace; /* 等宽字体，日志更好看 */
}

.log-info {
  color: #d4d4d4;
}

.log-success {
  color: #22c55e;
}

.log-warning {
  color: #f59e0b;
}

.log-error {
  color: #ef4444;
}

.log-line-error {
  background-color: rgba(239, 68, 68, 0.1);
}

.log-line-warning {
  background-color: rgba(245, 158, 11, 0.1);
}

.log-line-success {
  background-color: rgba(34, 197, 94, 0.1);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .build-log-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-actions {
    justify-content: center;
  }

  .log-content {
    padding: 12px 16px;
    font-size: 12px;
  }

  .build-log-page {
    padding: 8px;
  }
}
</style>
