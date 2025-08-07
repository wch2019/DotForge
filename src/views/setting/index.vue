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
                  <n-select v-model:value="systemConfig.theme" :options="themeOptions" @update:value="onThemeChange"/>
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
                <FilePicker
                    v-model="systemConfig.defaultProjectPath"
                    type="directory"
                    placeholder="数据存储路径"
                />
                <div class="item-desc">
                  应用数据将存储在此目录下（<span class="text-red-400">不支持移动到自身子目录中</span>）
                </div>
              </div>
              <div class="setting-item">
                <div class="item-label">导出数据</div>
                <div class="item-content">
                  <n-button @click="exportData" type="primary" disabled>导出所有数据</n-button>
                </div>
                <div class="item-desc">导出项目列表和构建日志</div>
              </div>

              <div class="setting-item">
                <div class="item-label">清除数据</div>
                <div class="item-content">
                  <n-button @click="clearData" type="error" disabled>清除所有数据</n-button>
                </div>
                <div class="item-desc">清除所有项目数据和构建日志</div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <div class="setting-footer">
        <n-button @click="resetSettings">重置为默认设置</n-button>
        <n-button type="primary" @click="saveSettings">保存</n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, toRaw} from 'vue'
import {defaultConfig, type AppConfig} from '../../../shared/default-config'
import FilePicker from "@/components/FilePicker.vue";
import {useMessage, useDialog} from 'naive-ui'
import {useThemeStore} from '@/stores/theme'

const themeStore = useThemeStore()
const dialog = useDialog()
const message = useMessage()
// 系统配置
const systemConfig = ref<AppConfig>({...defaultConfig});
// 目录
const defaultProjectPath = ref<string>()

const themeOptions = [
  {label: '浅色', value: 'light'},
  {label: '深色', value: 'dark'},
  {label: '跟随系统', value: 'auto'}
]
const languageOptions = [
  {label: '中文', value: 'zh-CN'}
]

// 导出数据
async function exportData() {
  message.warning('暂未实现')
}

// 清除数据
async function clearData() {
  dialog.warning({
    title: '警告',
    content: '确定要清除所有数据吗？此操作不可恢复。',
    positiveText: '清除',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      message.success('暂未实现')
    },
    onNegativeClick: () => {}
  })
}

// 重置设置
function resetSettings() {
  dialog.warning({
    title: '警告',
    content: '确定要重置所有设置吗？',
    positiveText: '重置',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      const config = defaultConfig
      config.defaultProjectPath  = defaultProjectPath.value!
      window.electronAPI.writeConfig(toRaw(config))
      init()
      message.success('重置成功')
    },
    onNegativeClick: () => {}
  })
}

// 主题保存
function onThemeChange(theme: any) {
  themeStore.setTheme(theme)
}

// 保存设置
async function saveSettings() {
  try {
    await window.electronAPI.writeConfig(toRaw(systemConfig.value))
    if (systemConfig.value.defaultProjectPath != defaultProjectPath.value) {
      dialog.warning({
        title: '警告',
        content: '数据存储目录修改是否迁移目录',
        positiveText: '迁移',
        negativeText: '不迁移',
        draggable: true,
        onPositiveClick: () => {
          window.electronAPI.migrateDataDir(defaultProjectPath.value, systemConfig.value.defaultProjectPath)
          init()
          message.success('设置成功')
        },
        onNegativeClick: () => {
          message.success('设置成功')
        }
      })
    } else {
      message.success('设置成功')
    }

  } catch (error) {
    message.error('保存设置失败，' + error)
  }
}

// 获取目录
async function init() {
  const path = window.electronAPI.getConfigPath()
  console.log('配置文件路径:', path)

  systemConfig.value = await window.electronAPI.readConfig()
  defaultProjectPath.value = systemConfig.value.defaultProjectPath
  console.log('配置读取:', systemConfig)
}

onMounted(async () => {
  await init()
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
