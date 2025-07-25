<template>
  <div class="p-6">
    <!-- 页面标题和操作按钮 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">我的项目</h2>
      <div class="flex gap-2">
        <n-button type="primary" @click="goAddProject">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          添加项目
        </n-button>
        <n-button type="success" @click="buildAll">
          构建全部项目
        </n-button>
      </div>
    </div>

    <!-- 项目卡片列表 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <n-card
        v-for="project in projects"
        :key="project.id"
        class="flex flex-col"
        :title="project.name"
      >
        <div class="mb-2 text-gray-500 text-sm truncate">
          路径：{{ project.path }}
        </div>
        <div class="flex items-center mb-2 gap-2">
          <n-tag
            :type="statusTypeMap[project.status]"
            size="small"
            round
          >
            {{ statusTextMap[project.status] }}
          </n-tag>
          <span class="text-xs text-gray-400">上次构建：{{ project.lastBuildTime }}</span>
        </div>
        <div class="flex gap-2 mt-2">
          <n-button size="small" @click="build(project)">构建</n-button>
          <n-button size="small" @click="viewLogs(project)">查看日志</n-button>
          <n-button size="small" @click="edit(project)">编辑</n-button>
          <n-button size="small" type="error" @click="remove(project)">删除</n-button>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag, NIcon } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

// 项目数据示例
const projects = ref([
  {
    id: 1,
    name: 'AI 自动部署',
    path: '/Users/xxx/ai-deploy',
    status: 'success', // success | failed | building
    lastBuildTime: '3分钟前'
  },
  {
    id: 2,
    name: '前端平台',
    path: '/Users/xxx/frontend',
    status: 'failed',
    lastBuildTime: '10分钟前'
  },
  {
    id: 3,
    name: '后端服务',
    path: '/Users/xxx/backend',
    status: 'building',
    lastBuildTime: '1分钟前'
  }
])

const statusTextMap = {
  success: '成功',
  failed: '失败',
  building: '构建中'
}
const statusTypeMap = {
  success: 'success',
  failed: 'error',
  building: 'warning'
}

const router = useRouter()

function goAddProject() {
  router.push({ name: 'add-project' }) // 需在路由中配置对应 name
}
function buildAll() {
  // 触发全部项目构建逻辑
  window.$message?.info('开始构建全部项目')
}
function build(project: any) {
  // 单个项目构建逻辑
  window.$message?.info(`开始构建：${project.name}`)
}
function viewLogs(project: any) {
  // 查看日志逻辑
  window.$message?.info(`查看日志：${project.name}`)
}
function edit(project: any) {
  // 编辑逻辑
  router.push({ name: 'edit-project', params: { id: project.id } })
}
function remove(project: any) {
  // 删除逻辑
  window.$message?.warning(`删除项目：${project.name}`)
}
</script>