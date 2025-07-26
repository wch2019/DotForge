<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">欢迎使用 DotForge</h2>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <n-card>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-500">{{ stats.totalProjects }}</div>
          <div class="text-gray-500">总项目数</div>
        </div>
      </n-card>
      <n-card>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-500">{{ stats.successBuilds }}</div>
          <div class="text-gray-500">成功构建</div>
        </div>
      </n-card>
      <n-card>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-500">{{ stats.failedBuilds }}</div>
          <div class="text-gray-500">失败构建</div>
        </div>
      </n-card>
      <n-card>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-500">{{ stats.buildingNow }}</div>
          <div class="text-gray-500">正在构建</div>
        </div>
      </n-card>
    </div>

    <!-- 快速操作 -->
    <n-card title="快速操作" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <n-button type="primary" size="large" @click="goToProjects">
          <template #icon>
            <n-icon><FolderOutline /></n-icon>
          </template>
          项目管理
        </n-button>
        <n-button type="success" size="large" @click="addNewProject">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          添加项目
        </n-button>
        <n-button type="info" size="large" @click="goToSettings">
          <template #icon>
            <n-icon><SettingsOutline /></n-icon>
          </template>
          应用设置
        </n-button>
      </div>
    </n-card>

    <!-- 最近构建 -->
    <n-card title="最近构建" class="mb-6">
      <n-list>
        <n-list-item v-for="build in recentBuilds" :key="build.id">
          <template #prefix>
            <n-icon :color="build.status === 'success' ? '#18a058' : '#d03050'">
              <CheckmarkCircleOutline v-if="build.status === 'success'" />
              <CloseCircleOutline v-else />
            </n-icon>
          </template>
          <n-thing :title="build.projectName" :description="build.time">
            <template #description>
              <span class="text-gray-500">{{ build.time }}</span>
            </template>
          </n-thing>
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NButton, NCard, NList, NListItem, NThing, NIcon 
} from 'naive-ui'
import { 
  FolderOutline, AddOutline, SettingsOutline, 
  CheckmarkCircleOutline, CloseCircleOutline 
} from '@vicons/ionicons5'

const router = useRouter()

// 统计数据
const stats = ref({
  totalProjects: 12,
  successBuilds: 156,
  failedBuilds: 8,
  buildingNow: 2
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
  }
])

function goToProjects() {
  router.push({ name: 'Project' })
}

function addNewProject() {
  router.push({ name: 'Project' })
}

function goToSettings() {
  router.push({ name: 'Settings' })
}
</script>