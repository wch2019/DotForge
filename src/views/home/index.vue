<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-header">
          <img src="/dot-forge.png" alt="App Icon" class="w-25 h-25"/>
          <div class="welcome-text">
            <h1 class="welcome-title">欢迎使用 DotForge</h1>
            <p class="welcome-subtitle">强大的CI/CD项目管理平台，让构建更简单</p>
          </div>
        </div>
        <div class="welcome-stats">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalProjects }}</div>
            <div class="stat-label">总项目数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number success">{{ stats.successBuilds }}</div>
            <div class="stat-label">成功构建</div>
          </div>
          <div class="stat-item">
            <div class="stat-number failed">{{ stats.failedBuilds }}</div>
            <div class="stat-label">失败构建</div>
          </div>
          <div class="stat-item">
            <div class="stat-number building">{{ stats.buildingNow }}</div>
            <div class="stat-label">正在构建</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 快速操作 -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">
            <n-icon size="24" class="title-icon">
              <FlashOutline/>
            </n-icon>
            快速操作
          </h2>
          <p class="section-description">快速访问常用功能</p>
        </div>
        <div class="quick-actions">
          <div class="action-card" @click="goToProjects">
            <div class="action-icon">
              <n-icon size="32" color="#3b82f6">
                <FolderOutline/>
              </n-icon>
            </div>
            <div class="action-content">
              <h3 class="action-title">项目管理</h3>
              <p class="action-description">查看和管理所有CI/CD项目</p>
            </div>
            <div class="action-arrow">
              <n-icon size="20" color="#9ca3af">
                <ChevronForwardOutline/>
              </n-icon>
            </div>
          </div>

          <div class="action-card" @click="addNewProject">
            <div class="action-icon">
              <n-icon size="32" color="#10b981">
                <AddOutline/>
              </n-icon>
            </div>
            <div class="action-content">
              <h3 class="action-title">添加项目</h3>
              <p class="action-description">创建新的CI/CD项目配置</p>
            </div>
            <div class="action-arrow">
              <n-icon size="20" color="#9ca3af">
                <ChevronForwardOutline/>
              </n-icon>
            </div>
          </div>

          <div class="action-card" @click="goToSettings">
            <div class="action-icon">
              <n-icon size="32" color="#8b5cf6">
                <SettingsOutline/>
              </n-icon>
            </div>
            <div class="action-content">
              <h3 class="action-title">应用设置</h3>
              <p class="action-description">配置应用参数和偏好设置</p>
            </div>
            <div class="action-arrow">
              <n-icon size="20" color="#9ca3af">
                <ChevronForwardOutline/>
              </n-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近构建 -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">
            <n-icon size="24" class="title-icon">
              <TimeOutline/>
            </n-icon>
            最近构建
          </h2>
          <p class="section-description">查看最近的构建记录</p>
        </div>
        <div class="recent-builds">
          <div
              v-for="build in recentBuilds"
              :key="build.id"
              class="build-item"
              :class="{ 'build-success': build.status === 'success', 'build-failed': build.status === 'failed' }"
          >
            <div class="build-status">
              <n-icon
                  size="20"
                  :color="build.status === 'success' ? '#10b981' : '#ef4444'"
                  class="status-icon"
              >
                <CheckmarkCircleOutline v-if="build.status === 'success'"/>
                <CloseCircleOutline v-else/>
              </n-icon>
            </div>
            <div class="build-info">
              <div class="build-name">{{ build.projectName }}</div>
              <div class="build-time">{{ build.time }}</div>
            </div>
            <div class="build-actions">
              <n-button quaternary size="small" circle>
                <template #icon>
                  <n-icon size="16">
                    <EyeOutline/>
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {
  NButton, NIcon
} from 'naive-ui'
import {
  FolderOutline, AddOutline, SettingsOutline,
  CheckmarkCircleOutline, CloseCircleOutline,
  RocketOutline, FlashOutline, TimeOutline,
  ChevronForwardOutline, EyeOutline
} from '@vicons/ionicons5'
import {ProjectData} from "@/types/project.ts";

const router = useRouter()

// 项目数据示例
const projects = ref<ProjectData[]>([])

// 统计数据
const stats = computed(() => {
  const successBuilds = projects.value.filter(p => p.status === 'success').length
  const buildingNow = projects.value.filter(p => p.status === 'building').length
  const failedBuilds = projects.value.filter(p => p.status === 'failed').length
  const totalProjects = projects.value.length

  return {
    successBuilds,
    buildingNow,
    failedBuilds,
    totalProjects
  }
})

// 最近构建记录
const recentBuilds = ref([
  {
    id: 1,
    projectName: '前端平台',
    status: 'success',
    time: '2分钟前'
  },
  {
    id: 2,
    projectName: '后端服务',
    status: 'failed',
    time: '5分钟前'
  },
  {
    id: 3,
    projectName: 'AI 自动部署',
    status: 'success',
    time: '10分钟前'
  },
  {
    id: 4,
    projectName: '移动端应用',
    status: 'success',
    time: '15分钟前'
  }
])

function goToProjects() {
  router.push({name: 'Project'})
}

function addNewProject() {
  router.push({name: 'Project'})
}

function goToSettings() {
  router.push({name: 'Setting'})
}

// 获取项目
async function getProjects() {
  const project = await window.electronAPI.getProjects()
  if (project) {
    Object.assign(projects.value, project)
  }
}

getProjects()
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--content-bg);
  padding: 24px;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}


.welcome-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

.welcome-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

.stat-number.success {
  color: #a7f3d0;
}

.stat-number.failed {
  color: #fca5a5;
}

.stat-number.building {
  color: #fde047;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr 1fr;
  }
}

/* 卡片样式 */
.section-card {
  background: var(--content-bg);
  border: 1px solid var(--n-border-color);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #667eea;
}

.section-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* 快速操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: var(--action-card-bg);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  background: var(--action-card-bg-hover);
  border-color: var(--action-card-border-color-hover);
  transform: translateX(4px);
}

.action-icon {
  background: var(--content-bg);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.action-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.action-arrow {
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* 最近构建 */
.recent-builds {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.build-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--action-card-bg);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.build-item:hover {
  background: var(--action-card-bg-hover);
  border-color: var(--action-card-border-color-hover);
}

.build-item.build-success {
  border-left: 4px solid #10b981;
}

.build-item.build-failed {
  border-left: 4px solid #ef4444;
}

.build-status {
  flex-shrink: 0;
}

.status-icon {
  animation: pulse 2s infinite;
}

.build-info {
  flex: 1;
}

.build-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.build-time {
  font-size: 14px;
  color: #6b7280;
}

.build-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.build-item:hover .build-actions {
  opacity: 1;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-page {
    padding: 16px;
  }

  .welcome-section {
    padding: 24px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .welcome-subtitle {
    font-size: 16px;
  }

  .welcome-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-item {
    padding: 16px;
  }

  .stat-number {
    font-size: 24px;
  }

  .section-card {
    padding: 24px;
  }

  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>
