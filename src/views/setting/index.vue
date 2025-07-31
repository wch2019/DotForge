<template>
  <div class="setting-page">
    <div class="setting-container">
      <div class="setting-header">
        <h1 class="setting-title">应用设置</h1>
      </div>

      <div class="settings-content">
        <n-tabs type="line" animated placement="left">
          <!-- 系统设置 Tab -->
          <n-tab-pane name="system" tab="常规设置">
            <div class="tab-content">

              <div class="setting-item">
                <div class="item-label">主题模式</div>
                <div class="item-content">
                  <n-select v-model:value="systemConfig.theme" :options="themeOptions"/>
                </div>
              </div>

              <div class="setting-item">
                <div class="item-label">语言</div>
                <div class="item-content">
                  <n-select v-model:value="systemConfig.language" :options="languageOptions"/>
                </div>
              </div>

              <div class="setting-item">
                <div class="item-label">更新</div>
                <div class="item-content">
                  <n-checkbox v-model:checked="systemConfig.autoUpdate">自动检查更新</n-checkbox>
                </div>
              </div>
            </div>
          </n-tab-pane>
          <n-tab-pane name="data" tab="数据管理">
            <div class="tab-content">
              <div class="setting-item">
                <div class="item-label">数据存储路径</div>
                <div class="item-content">
                  <n-input v-model:value="systemConfig.defaultProjectPath" placeholder="数据存储路径" readonly/>
                  <n-button @click="selectDataDir" type="primary">选择路径</n-button>
                </div>
                <div class="item-desc">应用数据将存储在此目录下</div>
              </div>
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
import { onMounted, ref} from 'vue'
import type {AppConfig} from "../../../electron/store/setting.ts";

// 系统配置
const systemConfig = ref <AppConfig> ({
  theme: 'light',
  language: 'zh-CN',
  autoUpdate: true,
  defaultProjectPath: ""
});

const themeOptions = [
  {label: '浅色', value: 'light'},
  {label: '深色', value: 'dark'},
  {label: '跟随系统', value: 'auto'}
]
const languageOptions = [
  {label: '中文', value: 'zh-CN'}
]


function selectDataDir() {
  console.log('选择数据目录')
}

// 导出数据
async function exportData() {
  // try {
  //   const projects = dataStore.getProjects()
  //   const buildLogs = dataStore.getBuildLogs()
  //
  //   const exportData = {
  //     projects,
  //     buildLogs,
  //     exportTime: new Date().toISOString()
  //   }
  //
  //   const dataStr = JSON.stringify(exportData, null, 2)
  //   const blob = new Blob([dataStr], {type: 'application/json'})
  //   const url = URL.createObjectURL(blob)
  //   const a = document.createElement('a')
  //   a.href = url
  //   a.download = `dotforge-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
  //   document.body.appendChild(a)
  //   a.click()
  //   document.body.removeChild(a)
  //   URL.revokeObjectURL(url)
  //
  //   console.log('数据导出成功')
  // } catch (error) {
  //   console.error('导出数据失败:', error)
  // }
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

  }
}

// 保存设置
async function saveSettings() {
  try {
    await window.electronAPI.writeConfig(systemConfig.value)
    console.log('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

onMounted(async () => {
  const path = await window.electronAPI.getConfigPath()
  console.log('配置文件路径:', path)

  systemConfig.value = await window.electronAPI.readConfig()
  console.log('配置读取:', systemConfig.value)
})
</script>

<style scoped>
.setting-page {
  background: var(--content-bg);
  height: var(--content-height);
  padding: 16px;

}

.setting-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--quick-actions);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.setting-header {
  text-align: center;
  margin-bottom: 10px;
}

.setting-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.settings-content {
  min-height: calc(100vh - 230px);
}

.tab-content {
  height: calc(100vh - 290px);
  overflow-y: auto;
  padding: 16px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--n-text-color);
  margin: 24px 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--n-border-color);
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
  padding-top: 20px;
  border-top: 1px solid var(--n-border-color);
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
