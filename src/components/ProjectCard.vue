<template>
  <div class="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-200">
    <div class="flex items-center justify-between">
      <div class="font-bold text-lg">{{ project.name }}</div>
      <div class="flex items-center gap-1">
        <span :class="statusDotClass" class="w-3 h-3 rounded-full inline-block"></span>
        <span class="text-sm">{{ statusText }}</span>
      </div>
    </div>
    <div class="text-gray-500 text-sm truncate">{{ project.path }}</div>
    <div class="flex gap-2 mt-2">
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" @click="onBuild(project)">开始构建</button>
      <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded" @click="onEdit(project)">编辑</button>
      <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" @click="onDelete(project)">删除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

interface Project {
  name: string
  path: string
  status: 'idle' | 'building' | 'success' | 'fail'
}

const props = defineProps<{
  project: Project
  onBuild: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}>()

const statusMap = {
  idle: { text: '空闲', dot: 'bg-gray-400' },
  building: { text: '构建中', dot: 'bg-blue-400 animate-pulse' },
  success: { text: '成功', dot: 'bg-green-500' },
  fail: { text: '失败', dot: 'bg-red-500' },
}

const statusDotClass = computed(() => statusMap[props.project.status].dot)
const statusText = computed(() => statusMap[props.project.status].text)
</script>

<style scoped>
</style> 