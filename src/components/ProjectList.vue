<template>
  <div class="p-8 min-h-screen bg-gray-50">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">CI/CD 项目列表</h1>
      <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" @click="goToAdd">添加新项目</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProjectCard
        v-for="project in projects"
        :key="project.name"
        :project="project"
        @build="onBuild"
        @edit="onEdit"
        @delete="onDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProjectCard from './ProjectCard.vue'

// 假数据
const projects = ref([
  { name: 'AI 平台', path: 'D:/Projects/ai-platform', status: 'idle' },
  { name: '前端门户', path: 'D:/Projects/portal', status: 'success' },
  { name: '后端服务', path: 'D:/Projects/backend', status: 'fail' },
  { name: '自动化工具', path: 'D:/Projects/auto-tool', status: 'building' },
])

const router = useRouter()

function goToAdd() {
  router.push('/edit')
}

function onBuild(project: any) {
  // 发送 IPC 消息
  window.electron?.ipcRenderer?.send('start-build', project)
}

function onEdit(project: any) {
  router.push({ path: '/edit', query: { name: project.name } })
}

function onDelete(project: any) {
  // 这里只是演示，实际应有确认和数据持久化
  projects.value = projects.value.filter((p) => p.name !== project.name)
}
</script>

<style scoped>
</style> 