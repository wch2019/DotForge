<template>
  <div class="setting-page">
    <div class="setting-container">
      <div class="setting-header">
        <h1 class="setting-title">应用设置</h1>
        <p class="setting-description">配置应用环境和系统设置</p>
      </div>
      
      <div class="settings-content">
        <n-tabs type="line" animated>
          <!-- 配置环境 Tab -->
          <n-tab-pane name="environment" tab="配置环境">
            <div class="tab-content">
              <div class="section-title">环境配置</div>
              <div class="setting-item">
                <div class="item-label">Node.js 路径</div>
                <div class="item-content">
                  <n-input v-model:value="envConfig.nodePath" placeholder="Node.js 可执行文件路径" />
                  <n-button @click="selectNodePath" type="primary">选择路径</n-button>
                </div>
                <div class="item-desc">指定 Node.js 运行时路径</div>
              </div>

              <div class="setting-item">
                <div class="item-label">Java 路径</div>
                <div class="item-content">
                  <n-input v-model:value="envConfig.javaPath" placeholder="Java 可执行文件路径" />
                  <n-button @click="selectJavaPath" type="primary">选择路径</n-button>
                </div>
                <div class="item-desc">指定 Java 运行时路径</div>
              </div>

              <div class="setting-item">
                <div class="item-label">Maven 路径</div>
                <div class="item-content">
                  <n-input v-model:value="envConfig.mavenPath" placeholder="Maven 可执行文件路径" />
                  <n-button @click="selectMavenPath" type="primary">选择路径</n-button>
                </div>
                <div class="item-desc">指定 Maven 构建工具路径</div>
              </div>

              <div class="setting-item">
                <div class="item-label">Docker 路径</div>
                <div class="item-content">
                  <n-input v-model:value="envConfig.dockerPath" placeholder="Docker 可执行文件路径" />
                  <n-button @click="selectDockerPath" type="primary">选择路径</n-button>
                </div>
                <div class="item-desc">指定 Docker 容器化工具路径</div>
              </div>

              <div class="setting-item">
                <div class="item-label">Git 路径</div>
                <div class="item-content">
                  <n-input v-model:value="envConfig.gitPath" placeholder="Git 可执行文件路径" />
                  <n-button @click="selectGitPath" type="primary">选择路径</n-button>
                </div>
                <div class="item-desc">指定 Git 版本控制工具路径</div>
              </div>
            </div>
          </n-tab-pane>

          <!-- 系统设置 Tab -->
          <n-tab-pane name="system" tab="系统设置">
            <div class="tab-content">
              <div class="section-title">数据存储</div>
              <div class="setting-item">
                <div class="item-label">数据存储路径</div>
                <div class="item-content">
                  <n-input v-model:value="systemConfig.dataDir" placeholder="数据存储路径" readonly />
                  <n-button @click="selectDataDir" type="primary">选择路径</n-button>
                </div>
                <div class="item-desc">应用数据将存储在此目录下</div>
              </div>

              <div class="section-title">外观设置</div>
              <div class="setting-item">
                <div class="item-label">主题模式</div>
                <div class="item-content">
                  <n-select v-model:value="systemConfig.theme" :options="themeOptions" />
                </div>
                <div class="item-desc">选择应用的主题模式</div>
              </div>

              <div class="section-title">应用设置</div>
              <div class="setting-item">
                <div class="item-label">自动保存</div>
                <div class="item-content">
                  <n-switch v-model:value="systemConfig.autoSave" />
                </div>
                <div class="item-desc">自动保存项目更改</div>
              </div>

              <div class="setting-item">
                <div class="item-label">构建超时时间</div>
                <div class="item-content">
                  <n-input-number v-model:value="systemConfig.buildTimeout" :min="1" :max="120" />
                  <span class="unit-text">分钟</span>
                </div>
                <div class="item-desc">设置构建任务的超时时间</div>
              </div>

              <div class="setting-item">
                <div class="item-label">最大并发构建数</div>
                <div class="item-content">
                  <n-input-number v-model:value="systemConfig.maxConcurrentBuilds" :min="1" :max="10" />
                </div>
                <div class="item-desc">同时运行的最大构建任务数</div>
              </div>

              <div class="section-title">数据管理</div>
              <div class="setting-item">
                <div class="item-label">导出数据</div>
                <div class="item-content">
                  <n-button @click="exportData" type="primary">导出所有数据</n-button>
                </div>
                <div class="item-desc">导出项目列表和构建日志</div>
              </div>

              <div class="setting-item">
                <div class="item-label">清除数据</div>
                <div class="item-content">
                  <n-button @click="clearData" type="error">清除所有数据</n-button>
                </div>
                <div class="item-desc">清除所有项目数据和构建日志</div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <div class="setting-footer">
        <n-button @click="resetSettings">重置</n-button>
        <n-button type="primary" @click="saveSettings">保存设置</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { NTabs, NTabPane, NInput, NButton, NSelect, NSwitch, NInputNumber } from 'naive-ui'
import dataStore from '@/utils/dataStore'

// 环境配置
const envConfig = reactive({
  nodePath: '',
  javaPath: '',
  mavenPath: '',
  dockerPath: '',
  gitPath: ''
})

// 系统配置
const systemConfig = reactive({
  dataDir: '',
  theme: 'auto' as 'light' | 'dark' | 'auto',
  autoSave: true,
  buildTimeout: 30,
  maxConcurrentBuilds: 3
})

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'auto' }
]

// 初始化设置
async function initSettings() {
  try {
    await dataStore.init()
    const settings = dataStore.getSettings()
    const environment = dataStore.getEnvironment()
    
    // 加载系统设置
    systemConfig.dataDir = settings.dataDir || await dataStore.getDataDir()
    systemConfig.theme = settings.theme
    systemConfig.autoSave = settings.autoSave
    systemConfig.buildTimeout = settings.buildTimeout
    systemConfig.maxConcurrentBuilds = settings.maxConcurrentBuilds
    
    // 加载环境配置
    Object.assign(envConfig, environment)
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 选择路径函数
function selectNodePath() {
  // TODO: 实现文件选择对话框
  console.log('选择 Node.js 路径')
}

function selectJavaPath() {
  console.log('选择 Java 路径')
}

function selectMavenPath() {
  console.log('选择 Maven 路径')
}

function selectDockerPath() {
  console.log('选择 Docker 路径')
}

function selectGitPath() {
  console.log('选择 Git 路径')
}

function selectDataDir() {
  console.log('选择数据目录')
}

// 导出数据
async function exportData() {
  try {
    const projects = dataStore.getProjects()
    const buildLogs = dataStore.getBuildLogs()
    
    const exportData = {
      projects,
      buildLogs,
      exportTime: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dotforge-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    console.log('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
  }
}

// 清除数据
async function clearData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
    try {
      console.log('数据清除成功')
    } catch (error) {
      console.error('清除数据失败:', error)
    }
  }
}

// 重置设置
function resetSettings() {
  if (confirm('确定要重置所有设置吗？')) {
    initSettings()
  }
}

// 保存设置
async function saveSettings() {
  try {
    // 保存系统设置
    await dataStore.updateSettings({
      dataDir: systemConfig.dataDir,
      theme: systemConfig.theme,
      autoSave: systemConfig.autoSave,
      buildTimeout: systemConfig.buildTimeout,
      maxConcurrentBuilds: systemConfig.maxConcurrentBuilds
    })
    
    // 保存环境配置
    await dataStore.updateEnvironment(envConfig)
    
    console.log('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

onMounted(() => {
  initSettings()
})
</script>

<style scoped>
.setting-page {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 32px 16px;
}

.setting-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 32px;
}

.setting-header {
  text-align: center;
  margin-bottom: 32px;
}

.setting-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.setting-description {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.settings-content {
  min-height: 400px;
}

.tab-content {
  padding: 16px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--n-text-color);
  margin: 24px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title:first-child {
  margin-top: 0;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.item-content .n-input,
.item-content .n-input-number {
  flex: 1;
}

.unit-text {
  font-size: 14px;
  color: #6b7280;
  margin-left: 8px;
}

.item-desc {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.setting-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .setting-container {
    padding: 24px 16px;
  }
  
  .setting-page {
    padding: 16px 8px;
  }
  
  .item-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .item-content .n-button {
    align-self: flex-start;
  }
  
  .setting-footer {
    flex-direction: column;
  }
}
</style>