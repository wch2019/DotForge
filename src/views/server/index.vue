<template>
  <div class="server-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <n-icon size="28" class="title-icon">
              <ServerOutline/>
            </n-icon>
            服务器管理
          </h1>
          <p class="page-subtitle">管理部署目标服务器，维护连接与元信息</p>
        </div>
        <div class="header-actions">
          <n-button type="primary" size="large" @click="goCreate" class="action-btn">
            <template #icon>
              <n-icon>
                <AddOutline/>
              </n-icon>
            </template>
            新增服务器
          </n-button>
        </div>
      </div>
    </div>

    <!-- 列表 -->
    <div class="servers-section">
      <div class="section-header">
        <h3 class="section-title">服务器列表</h3>
        <div class="section-actions">
          <n-input-group>
            <n-input v-model:value="keyword" placeholder="搜索名称/IP..." class="search-input">
              <template #prefix>
                <n-icon>
                  <SearchOutline/>
                </n-icon>
              </template>
            </n-input>
            <n-button type="primary" ghost>
              <template #icon>
                <n-icon>
                  <FilterOutline/>
                </n-icon>
              </template>
              筛选
            </n-button>
          </n-input-group>
        </div>
      </div>

      <div v-if="filteredServers.length !== 0" class="servers-grid">
        <n-card v-for="item in filteredServers" :key="item.id" class="server-card">
          <div class="server-header">
            <div class="server-info">
              <h4 class="server-name">{{ item.name }}</h4>
              <p class="server-host">{{ item.host }}:{{ item.port }}</p>
            </div>
          </div>

          <div class="server-details">
            <div class="detail-item">
              <n-icon size="16" class="detail-icon">
                <PricetagsOutline/>
              </n-icon>
              <span class="detail-text">标签：<n-tag :bordered="false" type="info">{{
                  item.tag || '默认'
                }}</n-tag></span>
            </div>
            <div class="detail-item">
              <n-icon size="16" class="detail-icon">
                <DocumentTextOutline/>
              </n-icon>
              <span class="detail-text">描述：{{ item.description }}</span>
            </div>
          </div>

          <div class="server-actions">
            <n-button size="small" @click="connectSSH(item)" class="action-btn">
              <template #icon>
                <n-icon>
                  <TerminalOutline/>
                </n-icon>
              </template>
              SSH
            </n-button>
            <n-button size="small" @click="edit(item)" class="action-btn">
              <template #icon>
                <n-icon>
                  <CreateOutline/>
                </n-icon>
              </template>
              编辑
            </n-button>
            <n-button size="small" type="error" @click="remove(item)" class="action-btn">
              <template #icon>
                <n-icon>
                  <TrashOutline/>
                </n-icon>
              </template>
              删除
            </n-button>
          </div>
        </n-card>
      </div>

      <div v-if="filteredServers.length === 0" class="empty-state">
        <n-icon size="64" class="empty-icon">
          <ServerOutline/>
        </n-icon>
        <h3 class="empty-title">暂无服务器</h3>
        <p class="empty-description">点击“新增服务器”维护目标主机</p>
        <n-button type="primary" size="large" @click="goCreate">
          <template #icon>
            <n-icon>
              <AddOutline/>
            </n-icon>
          </template>
          新增服务器
        </n-button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {
  NButton, NCard, NIcon, NInput, NInputGroup, NTag
} from 'naive-ui'
import {
  ServerOutline, AddOutline, AppsOutline, CheckmarkCircleOutline,
  CloseCircleOutline, SearchOutline, FilterOutline, DocumentTextOutline,
  CreateOutline, TrashOutline, PricetagsOutline, TerminalOutline
} from '@vicons/ionicons5'

const router = useRouter()

type ServerItem = {
  id: number
  name: string
  host: string
  port: number
  username?: string
  tag?: string
  description?: string
  status: 'online' | 'offline'
}

const keyword = ref('')
const servers = ref<ServerItem[]>([])

const filteredServers = computed(() => {
  if (!keyword.value) return servers.value
  return servers.value.filter(s =>
      s.name.toLowerCase().includes(keyword.value.toLowerCase()) ||
      s.host.toLowerCase().includes(keyword.value.toLowerCase())
  )
})

const onlineCount = computed(() => servers.value.filter(s => s.status === 'online').length)
const offlineCount = computed(() => servers.value.filter(s => s.status === 'offline').length)

async function initServers() {
  const list = await window.electronAPI.getServers?.()
  if (list) {
    servers.value = list.map((s: any) => ({
      id: s.id,
      name: s.name,
      host: s.host,
      port: s.port,
      username: s.username,
      tag: s.tag,
      description: s.description,
      status: 'offline' as const,
    }))
  }
}

function goCreate() {
  router.push({name: 'ServerEdit'})
}

function edit(item: ServerItem) {
  router.push({name: 'ServerEdit', query: {id: item.id}})
}

async function remove(item: ServerItem) {
  await window.electronAPI.deleteServer?.(item.id)
  servers.value = servers.value.filter(s => s.id !== item.id)
}

function connectSSH(item: ServerItem) {
  router.push({ name: 'ServerSSH', query: { serverId: item.id } })
}

initServers()
</script>

<style scoped>
.server-page {
  padding: 24px;
  background: var(--content-bg);
  min-height: var(--content-height);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #ffd700;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.servers-section {
  background: var(--content-bg);
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.search-input {
  width: 300px;
}

.servers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  flex: 1;
  align-content: start;
  min-height: 0;
}

.server-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all .3s ease;
  height: fit-content;
}

.server-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.server-info {
  flex: 1;
}

.server-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.server-host {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
}

.server-status {
  flex-shrink: 0;
}

.server-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-icon {
  color: #6b7280;
}

.detail-text {
  font-size: 14px;
  color: #6b7280;
}

.server-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 80px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  margin: 0 0 24px 0;
}

@media (max-width: 768px) {
  .server-page {
    padding: 16px;
    min-height: 100vh;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .page-title {
    font-size: 24px;
  }

  .servers-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .servers-section {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }
}
</style>


