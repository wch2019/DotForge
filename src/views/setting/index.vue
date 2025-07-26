<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">应用设置</h2>
    
    <n-card title="基本设置" class="mb-4">
      <n-space vertical>
        <n-form-item label="应用名称">
          <n-input v-model:value="settings.appName" placeholder="请输入应用名称" />
        </n-form-item>
        <n-form-item label="默认构建目录">
          <n-input v-model:value="settings.buildDir" placeholder="请输入默认构建目录" />
        </n-form-item>
        <n-form-item label="自动保存">
          <n-switch v-model:value="settings.autoSave" />
        </n-form-item>
      </n-space>
    </n-card>

    <n-card title="构建设置" class="mb-4">
      <n-space vertical>
        <n-form-item label="并发构建数">
          <n-input-number v-model:value="settings.maxConcurrentBuilds" :min="1" :max="10" />
        </n-form-item>
        <n-form-item label="构建超时时间(分钟)">
          <n-input-number v-model:value="settings.buildTimeout" :min="1" :max="120" />
        </n-form-item>
        <n-form-item label="构建日志保留天数">
          <n-input-number v-model:value="settings.logRetentionDays" :min="1" :max="365" />
        </n-form-item>
      </n-space>
    </n-card>

    <n-card title="通知设置" class="mb-4">
      <n-space vertical>
        <n-form-item label="构建完成通知">
          <n-switch v-model:value="settings.buildNotification" />
        </n-form-item>
        <n-form-item label="构建失败通知">
          <n-switch v-model:value="settings.failureNotification" />
        </n-form-item>
        <n-form-item label="系统托盘通知">
          <n-switch v-model:value="settings.trayNotification" />
        </n-form-item>
      </n-space>
    </n-card>

    <div class="flex gap-2">
      <n-button type="primary" @click="saveSettings">保存设置</n-button>
      <n-button @click="resetSettings">重置设置</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NCard, NSpace, NFormItem, NInput, NInputNumber, NSwitch } from 'naive-ui'

// 设置数据
const settings = ref({
  appName: 'DotForge',
  buildDir: '/Users/xxx/projects',
  autoSave: true,
  maxConcurrentBuilds: 3,
  buildTimeout: 30,
  logRetentionDays: 30,
  buildNotification: true,
  failureNotification: true,
  trayNotification: true
})

function saveSettings() {
  // 保存设置逻辑
  console.log('设置已保存', settings.value)
}

function resetSettings() {
  // 重置设置逻辑
  console.log('设置已重置')
}
</script>