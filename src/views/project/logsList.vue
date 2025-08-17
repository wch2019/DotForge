<template>
  <div class="logs-list-page">
    <div class="logs-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <n-button quaternary circle size="large" @click="goBack" class="back-btn">
              <template #icon>
                <n-icon>
                  <ArrowBackOutline/>
                </n-icon>
              </template>
            </n-button>
            <div class="header-info">
              <h1 class="page-title">{{ projectName }} 构建日志</h1>
              <p class="page-subtitle">查看项目的所有构建历史和详细日志</p>
            </div>
          </div>
          <div class="header-actions">
            <n-button type="primary" size="large" @click="refreshLogs" class="action-btn">
              <template #icon>
                <n-icon>
                  <RefreshOutline/>
                </n-icon>
              </template>
              刷新日志
            </n-button>
          </div>
        </div>
      </div>

      <!-- 日志列表视图 -->
      <div v-if="!selectedLog" class="logs-list-view">
        <div class="list-header">
          <div class="list-stats">
            <n-tag type="info" size="large">
              <template #icon>
                <n-icon>
                  <DocumentTextOutline/>
                </n-icon>
              </template>
              共 {{ buildLogs.length }} 条构建记录
            </n-tag>
          </div>
          <div class="list-filters">
            <n-select
                v-model:value="statusFilter"
                placeholder="构建状态"
                :options="statusOptions"
                size="medium"
                clearable
                class="filter-select"
            />
            <n-config-provider :locale="zhCN">
              <n-date-picker
                  v-model:value="dateRange"
                  type="daterange"
                  placeholder="构建时间范围"
                  size="medium"
                  clearable
                  class="filter-date"
              />
            </n-config-provider>
          </div>
        </div>

        <div class="logs-table">
          <n-data-table
              :columns="columns"
              :data="filteredLogs"
              :pagination="pagination"
              :bordered="false"
              :single-line="false"
              :style="{ height: `calc(100vh - 300px)` }"
              flex-height
              size="medium"
          />
        </div>

        <!-- 空状态 -->
        <div v-if="filteredLogs.length === 0" class="empty-state">
          <n-icon size="64" class="empty-icon">
            <DocumentTextOutline/>
          </n-icon>
          <h3 class="empty-title">暂无构建日志</h3>
          <p class="empty-description">该项目还没有构建记录，开始构建项目后这里会显示相关日志</p>
        </div>
      </div>

      <!-- 日志详情视图 -->
      <div v-else class="log-detail-view">
        <div class="detail-header">
          <div class="detail-info">
            <n-button quaternary circle size="medium" @click="backToList" class="back-list-btn">
              <template #icon>
                <n-icon>
                  <ArrowBackOutline/>
                </n-icon>
              </template>
            </n-button>
            <div class="detail-meta">
              <h2 class="detail-title">构建日志详情</h2>
              <div class="detail-status">
                <n-tag
                    :type="getStatusType(selectedLog.status)"
                    size="medium"
                    round
                    :bordered="false"
                >
                  <template #icon>
                    <n-icon v-if="selectedLog.status === 'building'">
                      <SyncOutline class="spinning"/>
                    </n-icon>
                    <n-icon v-else-if="selectedLog.status === 'success'">
                      <CheckmarkCircleOutline/>
                    </n-icon>
                    <n-icon v-else-if="selectedLog.status === 'failed'">
                      <CloseCircleOutline/>
                    </n-icon>
                  </template>
                  {{ getStatusText(selectedLog.status) }}
                </n-tag>
                <span class="build-time">{{ formatBuildTime(selectedLog.startTime) }}</span>
              </div>
            </div>
          </div>
          <div class="detail-actions">
            <n-button quaternary size="small" @click="exportLog" :disabled="!selectedLog.logs?.length">
              <template #icon>
                <n-icon>
                  <DownloadOutline/>
                </n-icon>
              </template>
              导出日志
            </n-button>
            <n-button quaternary size="small" @click="copyLog" :disabled="!selectedLog.logs?.length">
              <template #icon>
                <n-icon>
                  <CopyOutline/>
                </n-icon>
              </template>
              复制日志
            </n-button>
          </div>
        </div>

        <div class="log-content-container">
          <div class="log-content" ref="logContent">
            <div v-if="!selectedLog.logs?.length" class="empty-logs">
              <n-icon size="48" class="empty-icon">
                <DocumentTextOutline/>
              </n-icon>
              <p class="empty-text">暂无日志内容</p>
            </div>
            <div v-else class="log-lines">
              <div v-for="(line, index) in selectedLog.logs" :key="index" class="log-line"
                   :class="getLogLineClass(line)">
                <span class="line-number">{{ index + 1 }}</span>
                <span class="line-content" v-html="formatLogLine(line)"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, nextTick, h} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {NButton, NIcon, NTag, NSelect, NDatePicker, NDataTable, NConfigProvider, zhCN, useMessage} from 'naive-ui'
import {
  ArrowBackOutline, DocumentTextOutline, RefreshOutline, SyncOutline,
  CheckmarkCircleOutline, CloseCircleOutline, DownloadOutline, CopyOutline
} from '@vicons/ionicons5'
import type {BuildLog} from '@/types/buildLog'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const logContent = ref<HTMLElement>()

// 项目信息
const projectId = computed(() => route.query.id as string)
const projectName = ref(route.query.name as string || '项目')

// 构建日志数据
const buildLogs = ref<BuildLog[]>([])
const selectedLog = ref<BuildLog | null>(null)

// 筛选条件
const statusFilter = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  onChange: (page: number) => {
    pagination.value.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
  }
})

// 状态选项
const statusOptions = [
  {label: '构建中', value: 'building'},
  {label: '构建成功', value: 'success'},
  {label: '构建失败', value: 'failed'}
]

// 表格列定义
const columns = [
  {
    title: '构建时间',
    key: 'startTime',
    align: 'center',
    width: 180,
    render: (row: any) => formatBuildTime(row.startTime)
  },
  {
    title: '构建状态',
    key: 'status',
    align: 'center',
    width: 120,
    render: (row: any) => {
      const statusType = getStatusType(row.status)
      const statusText = getStatusText(row.status)
      return h(NTag, {
        type: statusType,
        size: 'small',
        round: true,
        bordered: false
      }, {
        icon: () => row.status === 'building' ? h(SyncOutline, {class: 'spinning'}) : null,
        default: () => statusText
      })
    }
  },
  {
    title: '构建时长',
    key: 'duration',
    align: 'center',
    width: 120,
    render: (row: any) => {
      if (row.status === 'building') return '进行中...'
      if (row.startTime && row.endTime) {
        const duration = row.endTime - row.startTime
        return formatDuration(duration)
      }
      return '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    align: 'center',
    width: 120,
    render: (row: any) => {
      return h('div', {class: 'action-buttons'}, [
        h(NButton, {
          size: 'small',
          type: 'primary',
          ghost: true,
          onClick: () => viewLogDetail(row)
        }, {default: () => '查看详情'})
      ])
    }
  }
]

// 过滤后的日志
const filteredLogs = computed(() => {
  let logs = buildLogs.value

  // 状态筛选
  if (statusFilter.value) {
    logs = logs.filter(log => log.status === statusFilter.value)
  }

  // 时间范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    logs = logs.filter(log => {
      const logTime = new Date(log.startTime).getTime()
      return logTime >= start && logTime <= end
    })
  }

  return logs
})

// 获取状态类型
function getStatusType(status: string) {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'error'
    case 'building':
      return 'warning'
    default:
      return 'default'
  }
}

// 获取状态文本
function getStatusText(status: string) {
  switch (status) {
    case 'success':
      return '构建成功'
    case 'failed':
      return '构建失败'
    case 'building':
      return '构建中'
    default:
      return '未知状态'
  }
}

// 格式化构建时间
function formatBuildTime(timestamp: number) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 格式化构建时长
function formatDuration(duration: number) {
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

// 查看日志详情
function viewLogDetail(log: any) {
  // 跳转到BuildLog页面
  router.push({
    name: 'ProjectLog', 
    query: { 
      id: projectId.value, 
      name: projectName.value,
      logId: log.id,
      action: 'view'
    }
  })
}

// 返回列表
function backToList() {
  selectedLog.value = null
}

// 返回项目页面
function goBack() {
  router.back()
}

// 刷新日志
function refreshLogs() {
  loadBuildLogs()
  message.success('日志已刷新')
}

// 导出日志
function exportLog() {
  if (!selectedLog.value?.logs?.length) return

  const logText = selectedLog.value.logs.join('\n')
  const blob = new Blob([logText], {type: 'text/plain'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName.value}-build-log-${formatBuildTime(selectedLog.value.startTime)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  message.success('日志导出成功')
}

// 复制日志
async function copyLog() {
  if (!selectedLog.value?.logs?.length) return

  try {
    const logText = selectedLog.value.logs.join('\n')
    await navigator.clipboard.writeText(logText)
    message.success('日志已复制到剪贴板')
  } catch (error) {
    message.error('复制失败，请手动选择复制')
  }
}

// 格式化日志行
function formatLogLine(line: string) {
  return line
      .replace(/\[INFO\]/g, '<span style="color: #22c55e">[INFO]</span>')
      .replace(/\[ERROR\]/g, '<span style="color: #ef4444">[ERROR]</span>')
      .replace(/\[WARNING\]/g, '<span style="color: #f59e0b">[WARNING]</span>')
      .replace(/\[SUCCESS\]/g, '<span style="color: #22c55e">[SUCCESS]</span>')
}

// 获取日志行样式类
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

// 加载构建日志
function loadBuildLogs() {
  // 模拟数据，实际项目中这里会调用API获取数据
  buildLogs.value = [
    {
      id: 1,
      projectId: projectId.value,
      projectName: projectName.value,
      status: 'success',
      startTime: Date.now() - 3600000, // 1小时前
      endTime: Date.now() - 3500000,   // 50分钟前
      logs: [
        '[INFO] 开始构建项目...',
        '[INFO] 获取项目路径...',
        '[INFO] 执行构建命令...',
        '[INFO] 生成构建产物...',
        '[SUCCESS] 构建成功完成'
      ]
    },
    {
      id: 2,
      projectId: projectId.value,
      projectName: projectName.value,
      status: 'failed',
      startTime: Date.now() - 7200000, // 2小时前
      endTime: Date.now() - 7100000,   // 1小时58分钟前
      logs: [
        '[INFO] 开始构建项目...',
        '[INFO] 获取项目路径...',
        '[ERROR] 构建命令执行失败',
        '[ERROR] 构建失败'
      ]
    },
    {
      id: 3,
      projectId: projectId.value,
      projectName: projectName.value,
      status: 'building',
      startTime: Date.now() - 300000,  // 5分钟前
      endTime: undefined,
      logs: [
        '[INFO] 开始构建项目...',
        '[INFO] 获取项目路径...',
        '[INFO] 执行构建命令...'
      ]
    }, {
      id: 3,
      projectId: projectId.value,
      projectName: projectName.value,
      status: 'building',
      startTime: Date.now() - 300000,  // 5分钟前
      endTime: undefined,
      logs: [
        '[INFO] 开始构建项目...',
        '[INFO] 获取项目路径...',
        '[INFO] 执行构建命令...'
      ]
    }, {
      id: 3,
      projectId: projectId.value,
      projectName: projectName.value,
      status: 'building',
      startTime: Date.now() - 300000,  // 5分钟前
      endTime: undefined,
      logs: [
        '[INFO] 开始构建项目...',
        '[INFO] 获取项目路径...',
        '[INFO] 执行构建命令...'
      ]
    }, {
      id: 3,
      projectId: projectId.value,
      projectName: projectName.value,
      status: 'building',
      startTime: Date.now() - 300000,  // 5分钟前
      endTime: undefined,
      logs: [
        '[INFO] 开始构建项目...',
        '[INFO] 获取项目路径...',
        '[INFO] 执行构建命令...'
      ]
    }, {
      id: 3,
      projectId: projectId.value,
      projectName: projectName.value,
      status: 'building',
      startTime: Date.now() - 300000,  // 5分钟前
      endTime: undefined,
      logs: [
        '[INFO] 开始构建项目...',
        '[INFO] 获取项目路径...',
        '[INFO] 执行构建命令...'
      ]
    }
  ]
}

onMounted(() => {
  loadBuildLogs()
})
</script>

<style scoped>
.logs-list-page {
  background: var(--content-bg);
  min-height: var(--content-height);
  height: var(--content-height);
  padding: 16px;
}

.logs-container {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--content-bg);
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  color: white;
}

.header-content {
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
  color: white;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 日志列表视图 */
.logs-list-view {
  height: calc(100vh - 200px);
  padding: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.list-stats {
  flex: 1;
}

.list-filters {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.filter-select {
  width: 140px;
}

.filter-date {
  width: 250px;
}

.logs-table {
  height: calc(100vh - 300px);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 日志详情视图 */
.log-detail-view {
  padding: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.detail-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-list-btn {
  flex-shrink: 0;
}

.detail-meta {
  flex: 1;
  min-width: 0;
}

.detail-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1f2937;
}

.detail-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.build-time {
  font-size: 14px;
  color: #6b7280;
}

.detail-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 日志内容 */
.log-content-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.log-content {
  height: 500px;
  overflow-y: auto;
  padding: 16px;
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
  flex: 0 0 auto;
}

.line-content {
  flex: 1;
  word-break: keep-all;
  white-space: pre;
  font-family: monospace;
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

/* 动画 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .logs-list-page {
    padding: 8px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .list-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .filter-date {
    width: 100%;
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .detail-actions {
    justify-content: center;
  }

  .log-content {
    height: 400px;
    padding: 12px;
    font-size: 12px;
  }
}
</style>
