<template>
  <div class="build-log-page">
    <div class="build-log-container">
      <!-- Top Header -->
      <div class="build-log-header">
        <div class="header-left">
          <n-button quaternary circle size="large" @click="goBack" class="back-btn">
            <template #icon><n-icon><ArrowBackOutline /></n-icon></template>
          </n-button>
          <div class="header-info">
            <h1 class="project-title">{{ projectName }} 构建日志</h1>
            <p class="build-status" :class="buildStatusClass">
              <n-icon size="16" class="status-icon">
                <CheckmarkCircleOutline v-if="buildStatus === 'success'" />
                <CloseCircleOutline v-else-if="buildStatus === 'failed'" />
                <SyncOutline v-else class="spinning" />
              </n-icon>
              {{ buildStatusText }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <n-button quaternary size="small" @click="clearLogs" :disabled="!logs.length">
            <template #icon><n-icon><TrashOutline /></n-icon></template>清除日志
          </n-button>
          <n-button quaternary size="small" @click="exportLogs" :disabled="!logs.length">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>导出日志
          </n-button>
          <n-button type="error" size="small" @click="stopBuild" :disabled="buildStatus !== 'building'">
            <template #icon><n-icon><StopOutline /></n-icon></template>停止构建
          </n-button>
        </div>
      </div>

      <!-- Log Content Area -->
      <div class="log-container">
        <div class="log-content" ref="logContent">
          <div v-if="logs.length === 0" class="empty-logs">
            <n-icon size="48" class="empty-icon"><DocumentTextOutline /></n-icon>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import {
  ArrowBackOutline, CheckmarkCircleOutline, CloseCircleOutline,
  SyncOutline, TrashOutline, DownloadOutline, StopOutline,
  DocumentTextOutline
} from '@vicons/ionicons5'
import dataStore from '@/utils/dataStore'
import {defaultProjectData} from "../../../electron/db/types/project.ts";

const router = useRouter()
const route = useRoute()
const logContent = ref<HTMLElement>()

const projectId = computed(() => route.query.id as string)
const projectName = ref(route.query.name as string || 'MyApp')
const buildStatus = ref<'building' | 'success' | 'failed'>('building')
const logs = ref<string[]>([])
const project = ref({...defaultProjectData});

const buildStatusText = computed(() => {
  switch (buildStatus.value) {
    case 'building': return '构建中...'
    case 'success': return '构建成功'
    case 'failed': return '构建失败'
    default: return '未知状态'
  }
})

const buildStatusClass = computed(() => {
  switch (buildStatus.value) {
    case 'building': return 'status-building'
    case 'success': return 'status-success'
    case 'failed': return 'status-failed'
    default: return ''
  }
})

function goBack() {
  router.back()
}

async function clearLogs() {
  logs.value = []
  // 保存到数据存储
  if (projectId.value) {
    const buildLogs = dataStore.getBuildLogs(projectId.value)
    if (buildLogs.length > 0) {
      const latestLog = buildLogs[buildLogs.length - 1]
      await dataStore.updateBuildLog(latestLog.id, { logs: [] })
    }
  }
}

function exportLogs() {
  if (logs.value.length === 0) return

  const logText = logs.value.join('\n')
  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName.value}-build-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function stopBuild() {
  buildStatus.value = 'failed'
  logs.value.push('[INFO] 构建已停止')
  // 保存构建日志
  saveBuildLog()
}

// 片段颜色
function formatLogLine(line: string) {
  // 简单的ANSI颜色模拟
  return line
    .replace(/\[INFO\]/g, '<span style="color: #22c55e">[INFO]</span>')
    .replace(/\x1b\[32m/g, '<span style="color: #22c55e">')
    .replace(/\x1b\[31m/g, '<span style="color: #ef4444">')
    .replace(/\x1b\[33m/g, '<span style="color: #f59e0b">')
    .replace(/\x1b\[0m/g, '</span>')
}

function getLogLineClass(line: string) {
  if (line.includes('ERROR') || line.includes('FAILED')) return 'log-line-error'
  if (line.includes('WARNING')) return 'log-line-warning'
  if (line.includes('SUCCESS') || line.includes('SUCCEEDED')) return 'log-line-success'
  return ''
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (logContent.value) {
      logContent.value.scrollTop = logContent.value.scrollHeight
    }
  })
}

async function saveBuildLog() {
  if (!projectId.value) return

  try {
    const buildLogs = dataStore.getBuildLogs(projectId.value)
    const existingLog = buildLogs.find(log => log.status === 'building')

    if (existingLog) {
      await dataStore.updateBuildLog(existingLog.id, {
        logs: logs.value,
        status: buildStatus.value,
        endTime: buildStatus.value !== 'building' ? Date.now() : undefined
      })
    } else {
      await dataStore.addBuildLog({
        projectId: projectId.value,
        projectName: projectName.value,
        status: buildStatus.value,
        logs: logs.value,
        startTime: Date.now(),
        endTime: buildStatus.value !== 'building' ? Date.now() : undefined
      })
    }
  } catch (error) {
    console.error('保存构建日志失败:', error)
  }
}

onMounted(async () => {
  if (projectId.value) {
    // 加载项目信息
    await getProjectInfo()

    // 加载最新的构建日志
    const buildLogs = dataStore.getBuildLogs(projectId.value)
    if (buildLogs.length > 0) {
      const latestLog = buildLogs[buildLogs.length - 1]
      logs.value = [...latestLog.logs]
      buildStatus.value = latestLog.status
    }
  }

  if (route.query.action === 'build') {
    buildStatus.value = 'building'
    runBuild()
  }

  scrollToBottom()
})

function simulateBuildProcess() {
  const buildSteps = [
    '[INFO] 开始构建项目...',
    '[INFO] 检查项目配置...',
    '[INFO] 拉取最新代码...',
    '[INFO] 安装依赖包...',
    '[INFO] 运行测试...',
    '[INFO] 执行构建命令...',
    '[INFO] 生成构建产物...',
    '[INFO] 构建成功完成'
  ]
}

function runBuild() {
  if (!projectId.value) return

  buildStatus.value = 'building'

  // 执行命令，比如 mvn clean package
  window.electronAPI.runCommand('java -version', { cwd: '' })

  window.electronAPI.onCommandOutput((line: string) => {
    console.log('命令输出:', line)
    logs.value.push(line)
    scrollToBottom()
  })

  window.electronAPI.onCommandFinished((code: number) => {
    if (code === 0) {
      buildStatus.value = 'success'
    } else {
      buildStatus.value = 'failed'
    }
    saveBuildLog()
  })
}

// 获取项目信息
async function getProjectInfo() {
  const projectInfo = await window.electronAPI.getProjectById(projectId.value)
  if (projectInfo) {
    Object.assign(project.value, projectInfo)
  }
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
}

.line-content {
  flex: 1;
  word-break: break-all;
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
