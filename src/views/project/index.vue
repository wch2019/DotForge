<template>
  <div class="project-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <n-icon size="28" class="title-icon">
              <FolderOutline/>
            </n-icon>
            项目管理
          </h1>
          <p class="page-subtitle">管理您的CI/CD项目，监控构建状态</p>
        </div>
        <div class="header-actions">
          <n-button type="primary" size="large" @click="goAddProject" class="action-btn">
            <template #icon>
              <n-icon>
                <AddOutline/>
              </n-icon>
            </template>
            添加项目
          </n-button>
          <n-button type="success" size="large" @click="buildAll" class="action-btn">
            <template #icon>
              <n-icon>
                <PlayOutline/>
              </n-icon>
            </template>
            构建全部
          </n-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <n-icon size="24">
                <CheckmarkCircleOutline/>
              </n-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.successCount }}</div>
              <div class="stat-label">成功构建</div>
            </div>
          </div>
        </n-card>
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon building">
              <n-icon size="24">
                <SyncOutline/>
              </n-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.buildingCount }}</div>
              <div class="stat-label">正在构建</div>
            </div>
          </div>
        </n-card>
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon failed">
              <n-icon size="24">
                <CloseCircleOutline/>
              </n-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.failedCount }}</div>
              <div class="stat-label">构建失败</div>
            </div>
          </div>
        </n-card>
        <n-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <n-icon size="24">
                <AppsOutline/>
              </n-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalCount }}</div>
              <div class="stat-label">总项目数</div>
            </div>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 项目列表 -->
    <div class="projects-section">
      <div class="section-header">
        <h3 class="section-title">项目列表</h3>
        <div class="section-actions">
          <n-input-group>
            <n-input v-model:value="searchKeyword" placeholder="搜索项目..." class="search-input">
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

      <div class="projects-grid">
        <n-card
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
        >
          <div class="project-header">
            <div class="project-info">
              <h4 class="project-name">{{ project.name }}</h4>
              <p class="project-path">{{ project.localPath }}</p>
            </div>
            <div class="project-status" v-if="project.status">
              <n-tag
                  :type="statusTypeMap[project.status]"
                  size="medium"
                  round
                  :bordered="false"
              >
                <template #icon>
                  <n-icon v-if="project.status === 'building'">
                    <SyncOutline class="spinning"/>
                  </n-icon>
                </template>
                {{ statusTextMap[project.status] }}
              </n-tag>
            </div>
          </div>

          <div class="project-details">
            <div class="detail-item" v-if="project.lastBuildTime">
              <n-icon size="16" class="detail-icon">
                <TimeOutline/>
              </n-icon>
              <span class="detail-text">上次构建：{{ project.lastBuildTime}}</span>
            </div>
            <div class="detail-item">
              <n-icon size="16" class="detail-icon">
                <PricetagsOutline/>
              </n-icon>
              <span class="detail-text">类型：<n-tag :bordered="false" type="info">{{ project.tag || '未知' }}</n-tag></span>
            </div>
          </div>

          <div class="project-actions">
            <n-button size="small" type="primary" @click="build(project)" class="action-btn">
              <template #icon>
                <n-icon>
                  <PlayOutline/>
                </n-icon>
              </template>
              构建
            </n-button>
            <n-button size="small" @click="viewLogs(project)" class="action-btn">
              <template #icon>
                <n-icon>
                  <DocumentTextOutline/>
                </n-icon>
              </template>
              日志
            </n-button>
            <n-button size="small" @click="edit(project)" class="action-btn">
              <template #icon>
                <n-icon>
                  <CreateOutline/>
                </n-icon>
              </template>
              编辑
            </n-button>
            <n-button size="small" type="error" @click="remove(project)" class="action-btn">
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

      <!-- 空状态 -->
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <n-icon size="64" class="empty-icon">
          <FolderOutline/>
        </n-icon>
        <h3 class="empty-title">暂无项目</h3>
        <p class="empty-description">点击"添加项目"开始创建您的第一个CI/CD项目</p>
        <n-button type="primary" size="large" @click="goAddProject">
          <template #icon>
            <n-icon>
              <AddOutline/>
            </n-icon>
          </template>
          添加项目
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, toRaw} from 'vue'
import {useRouter} from 'vue-router'
import {
  NButton, NCard, NTag, NIcon, NInput, NInputGroup, useDialog
} from 'naive-ui'
import {
  AddOutline, PlayOutline, FolderOutline, CheckmarkCircleOutline,
  SyncOutline, CloseCircleOutline, AppsOutline, SearchOutline,
  FilterOutline, TimeOutline, DocumentTextOutline,
  CreateOutline, TrashOutline, PricetagsOutline
} from '@vicons/ionicons5'
import {ProjectData} from "../../../electron/db/types/project.ts";
const dialog = useDialog()

// 搜索关键词
const searchKeyword = ref('')

// 项目数据示例
const projects = ref<ProjectData[]>([])

// 统计数据
const stats = computed(() => {
  const successCount = projects.value.filter(p => p.status === 'success').length
  const buildingCount = projects.value.filter(p => p.status === 'building').length
  const failedCount = projects.value.filter(p => p.status === 'failed').length
  const totalCount = projects.value.length

  return {
    successCount,
    buildingCount,
    failedCount,
    totalCount
  }
})

// 过滤后的项目列表
const filteredProjects = computed(() => {
  if (!searchKeyword.value) {
    return projects.value
  }
  return projects.value.filter(project =>
      project.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      project.path.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const statusTextMap: Record<string, string> = {
  success: '成功',
  failed: '失败',
  building: '构建中'
}
const statusTypeMap: Record<string, 'success' | 'error' | 'warning'> = {
  success: 'success',
  failed: 'error',
  building: 'warning'
}

const router = useRouter()

async function initProjects() {
  const project = await window.electronAPI.getProjects()
  if (project) {
    Object.assign(projects.value, project)
  }
}

function goAddProject() {
  router.push({name: 'ProjectCreate'})
}

function buildAll() {
  console.log('开始构建全部项目')
}

function build(project: any) {
  dialog.warning({
    title: '构建',
    content: '确定要进行构建吗？',
    positiveText: '确定',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      project.lastBuildTime= new Date().toLocaleString()
      project.status = 'building'
      console.log('开始构建项目', project)
      try {
         window.electronAPI.updateProject(parseInt(project.id), project);
      } catch (error) {
        console.error('保存项目失败:', error)
      }
      router.push({name: 'ProjectLog', query: { id: project.id ,name: project.name,action:'build'}})
    },
    onNegativeClick: () => {}
  })

}

function viewLogs(project: any) {
  console.log(`查看日志：${project.name}`)
}

function edit(project: any) {
  router.push({name: 'ProjectEdit', query: { id: project.id } })
}

function remove(project: any) {
  console.log(`删除项目：${project.name}`)
  dialog.warning({
    title: '删除',
    content: '确定要删除项目吗？',
    positiveText: '确定',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      projects.value = projects.value.filter(p => p.id !== project.id)
      // todo：物理删除项目所有关联数据
    },
    onNegativeClick: () => {}
  })
}

initProjects()
</script>

<style scoped>
.project-page {
  padding: 24px;
  background: var(--content-bg);
  min-height: var(--content-height);
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
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
  font-size: 32px;
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

.action-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.success {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
}

.stat-icon.building {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.stat-icon.failed {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.stat-icon.total {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--n-text-color);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 项目列表 */
.projects-section {
  background: var(--content-bg);
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.search-input {
  width: 300px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.project-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.project-path {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
}

.project-status {
  flex-shrink: 0;
}

.project-details {
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

.project-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 80px;
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
  margin: 0 0 24px 0;
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
  .project-page {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .page-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}
</style>
