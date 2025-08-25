<template>
  <div class="system-monitor">
    <div class="monitor-header">
      <h3 class="monitor-title">
        <n-icon size="20" class="title-icon">
          <AnalyticsOutline />
        </n-icon>
        系统监控
      </h3>
      <div class="monitor-actions">
        <n-button size="small" @click="refreshData" :loading="loading">
          <template #icon>
            <n-icon><RefreshOutline /></n-icon>
          </template>
          刷新
        </n-button>
        <n-switch v-model:value="autoRefresh" size="small">
          <template #checked>自动刷新</template>
          <template #unchecked>手动刷新</template>
        </n-switch>
      </div>
    </div>

    <div class="monitor-content">
      <!-- CPU 监控 -->
      <div class="monitor-card wide">
        <div class="card-header">
          <h4 class="card-title">CPU 使用率</h4>
          <span class="card-value">{{ systemInfo.cpu.usage }}%</span>
        </div>
        <div class="progress-container">
          <n-progress 
            type="line" 
            :percentage="systemInfo.cpu.usage" 
            :color="getProgressColor(systemInfo.cpu.usage)"
            :show-indicator="false"
            :height="8"
          />
        </div>
        <div class="card-details">
          <span>核心数: {{ systemInfo.cpu.cores }}</span>
          <span class="cpu-model">{{ systemInfo.cpu.model }}</span>
        </div>
      </div>

      <!-- 内存监控 -->
      <div class="monitor-card wide">
        <div class="card-header">
          <h4 class="card-title">内存使用率</h4>
          <span class="card-value">{{ systemInfo.memory.usage }}%</span>
        </div>
        <div class="progress-container">
          <n-progress 
            type="line" 
            :percentage="systemInfo.memory.usage" 
            :color="getProgressColor(systemInfo.memory.usage)"
            :show-indicator="false"
            :height="8"
          />
        </div>
        <div class="card-details">
          <span>已用: {{ formatBytes(systemInfo.memory.used * 1024 * 1024) }}</span>
          <span>可用: {{ formatBytes(systemInfo.memory.free * 1024 * 1024) }}</span>
          <span>总计: {{ formatBytes(systemInfo.memory.total * 1024 * 1024) }}</span>
        </div>
      </div>

      <!-- 磁盘监控 -->
      <div class="monitor-card wide">
        <div class="card-header">
          <h4 class="card-title">磁盘使用率</h4>
          <span class="card-value">{{ systemInfo.disk.usage }}%</span>
        </div>
        <div class="progress-container">
          <n-progress 
            type="line" 
            :percentage="systemInfo.disk.usage" 
            :color="getProgressColor(systemInfo.disk.usage)"
            :show-indicator="false"
            :height="8"
          />
        </div>
        <div class="card-details">
          <span>已用: {{ formatBytes(systemInfo.disk.used * 1024 * 1024) }}</span>
          <span>可用: {{ formatBytes(systemInfo.disk.free * 1024 * 1024) }}</span>
          <span>总计: {{ formatBytes(systemInfo.disk.total * 1024 * 1024) }}</span>
        </div>
      </div>

      <!-- 网络监控 -->
      <div class="monitor-card wide">
        <div class="card-header">
          <h4 class="card-title">网络流量</h4>
        </div>
        <div class="network-stats">
          <div class="network-item">
            <span class="network-label">接收</span>
            <span class="network-value">{{ formatBytes(systemInfo.network.rx) }}</span>
          </div>
          <div class="network-item">
            <span class="network-label">发送</span>
            <span class="network-value">{{ formatBytes(systemInfo.network.tx) }}</span>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="monitor-card wide">
        <div class="card-header">
          <h4 class="card-title">系统信息</h4>
        </div>
        <div class="system-stats">
          <div class="stat-item">
            <span class="stat-label">运行时间</span>
            <span class="stat-value">{{ formatUptime(systemInfo.uptime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">负载平均值</span>
            <span class="stat-value">{{ systemInfo.loadAverage.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { NButton, NIcon, NProgress, NSwitch } from 'naive-ui'
import { AnalyticsOutline, RefreshOutline } from '@vicons/ionicons5'

interface SystemInfo {
  cpu: {
    usage: number
    cores: number
    model: string
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  network: {
    rx: number
    tx: number
  }
  uptime: number
  loadAverage: number[]
}

interface Props {
  connectionId?: string
}

const props = defineProps<Props>()

const loading = ref(false)
const autoRefresh = ref(true)
const systemInfo = ref<SystemInfo>({
  cpu: { usage: 0, cores: 0, model: 'Unknown' },
  memory: { total: 0, used: 0, free: 0, usage: 0 },
  disk: { total: 0, used: 0, free: 0, usage: 0 },
  network: { rx: 0, tx: 0 },
  uptime: 0,
  loadAverage: [0, 0, 0]
})

let refreshInterval: NodeJS.Timeout | null = null

onMounted(() => {
  refreshData()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})

watch(autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

async function refreshData() {
  if (!props.connectionId) return
  
  loading.value = true
  try {
    // 这里应该调用SSH API获取系统信息
    const info = await window.electronAPI.getSSHSystemInfo?.(props.connectionId)
    if (info) {
      systemInfo.value = info
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
  } finally {
    loading.value = false
  }
}

function startAutoRefresh() {
  stopAutoRefresh()
  refreshInterval = setInterval(refreshData, 5000) // 每5秒刷新一次
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

function getProgressColor(percentage: number): string {
  if (percentage < 50) return '#52c41a'
  if (percentage < 80) return '#faad14'
  return '#ff4d4f'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}
</script>

<style scoped>
.system-monitor {
  background: var(--content-bg);
  border: 1px solid var(--n-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.monitor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.title-icon {
  color: #1890ff;
}

.monitor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.monitor-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  flex: 1;
  align-content: start;
}

.monitor-card {
  border: 1px solid var(--n-border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.monitor-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.monitor-card.wide {
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--n-text-color);
}

.card-value {
  font-size: 18px;
  font-weight: 700;
  color: #1890ff;
}

.progress-container {
  margin-bottom: 12px;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--n-text-color-3);
}

.cpu-model {
  font-family: 'Monaco', 'Menlo', monospace;
  word-break: break-all;
}

.network-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.network-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.network-label {
  font-size: 12px;
  color: var(--n-text-color-3);
}

.network-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-text-color);
  font-family: 'Monaco', 'Menlo', monospace;
}

.system-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--n-text-color-3);
}

.stat-value {
  font-size: 14px;
  color: var(--n-text-color);
  font-family: 'Monaco', 'Menlo', monospace;
}

@media (max-width: 768px) {
  .monitor-content {
    grid-template-columns: 1fr;
  }
  
  .monitor-card.wide {
    grid-column: span 1;
  }
  
  .system-stats {
    grid-template-columns: 1fr;
  }
  
  .monitor-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>
