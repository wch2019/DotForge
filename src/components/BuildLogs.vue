<template>
  <div class="p-8 min-h-screen bg-gray-50 flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span :class="statusDotClass" class="w-3 h-3 rounded-full inline-block"></span>
        <span class="font-bold text-lg">{{ statusText }}</span>
      </div>
      <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded" @click="goBack">返回项目列表</button>
    </div>
    <div ref="logArea" class="bg-black text-white rounded shadow p-4 flex-1 overflow-y-auto text-sm" style="height: 400px;">
      <div v-for="(line, idx) in highlightedLogs" :key="idx" v-html="line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const logs = ref<string[]>([])
const status = ref<'building' | 'success' | 'fail'>('building')
const logArea = ref<HTMLElement | null>(null)
const router = useRouter()

function goBack() {
  router.push('/')
}

function highlight(line: string) {
  let html = line
  html = html.replace(/(error)/gi, '<span class="text-red-400 font-bold">$1</span>')
  html = html.replace(/(success)/gi, '<span class="text-green-400 font-bold">$1</span>')
  return html
}

const highlightedLogs = computed(() => logs.value.map(highlight))

function handleLog(event: any, log: string) {
  logs.value.push(log)
  nextTick(() => {
    if (logArea.value) {
      logArea.value.scrollTop = logArea.value.scrollHeight
    }
  })
}

function handleError(event: any, log: string) {
  logs.value.push(log)
  status.value = 'fail'
  nextTick(() => {
    if (logArea.value) {
      logArea.value.scrollTop = logArea.value.scrollHeight
    }
  })
}

onMounted(() => {
  status.value = 'building'
  logs.value = []
  // 监听 IPC 消息
  window.electron?.ipcRenderer?.on('build-log', handleLog)
  window.electron?.ipcRenderer?.on('build-error', handleError)
  window.electron?.ipcRenderer?.on('build-success', () => {
    status.value = 'success'
  })
})

onBeforeUnmount(() => {
  window.electron?.ipcRenderer?.removeListener('build-log', handleLog)
  window.electron?.ipcRenderer?.removeListener('build-error', handleError)
  window.electron?.ipcRenderer?.removeAllListeners('build-success')
})

const statusMap = {
  building: { text: '构建中', dot: 'bg-blue-400 animate-pulse' },
  success: { text: '成功', dot: 'bg-green-500' },
  fail: { text: '失败', dot: 'bg-red-500' },
}
const statusDotClass = computed(() => statusMap[status.value].dot)
const statusText = computed(() => statusMap[status.value].text)
</script>

<style scoped>
</style> 