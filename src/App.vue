<template>
  <n-config-provider :theme="isDark ? darkTheme : null">
    <n-layout style="height: 100vh">
      <n-layout-header bordered class="titleBar" :style="headerStyle">
        <div class="flex items-center justify-between h-12 px-3">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity no-drag" @click="goToHome">
              <img src="/dot-forge.png" alt="App Icon" class="w-6 h-6"/>
              <span class="font-bold text-lg">DotForge</span>
            </div>
          </div>
          <div class="flex items-center gap-2 no-drag">
            <n-button quaternary circle size="large">
              <template #icon>
                <n-icon>
                  <SettingsOutline/>
                </n-icon>
              </template>
            </n-button>
            <n-button quaternary circle size="large" @click="toggleDark">
              <template #icon>
                <n-icon>
                  <component :is="isDark ? Moon : Sunny"/>
                </n-icon>
              </template>
            </n-button>
            <!-- 窗口控制按钮 -->
            <div class="flex items-center gap-2 ml-4">
              <!-- 最小化按钮 -->
              <n-button
                  quaternary
                  size="small"
                  @click="minimizeWindow"
                  class="window-control-btn"
              >
                <template #icon>
                  <n-icon>
                    <Subtract24Regular/>
                  </n-icon>
                </template>
              </n-button>

              <!-- 最大化/还原按钮 -->
              <n-button
                  quaternary
                  size="small"
                  @click="maximizeWindow"
                  class="window-control-btn"
              >
                <template #icon>
                  <n-icon>
                    <Square24Regular/>
                  </n-icon>
                </template>
              </n-button>

              <!-- 关闭按钮 -->
              <n-button
                  quaternary
                  size="small"
                  @click="closeWindow"
                  class="window-control-btn close-btn"
              >
                <template #icon>
                  <n-icon>
                    <Dismiss24Regular/>
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </n-layout-header>
      <n-layout has-sider style="height: calc(100vh - 49px);">
        <n-layout-sider width="150" bordered class="sidebar-debug">
          <AppMenu/>
        </n-layout-sider>
        <n-layout-content style="padding: 16px;">
          <router-view/>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {useRouter} from 'vue-router'
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NButton,
  NIcon,
  darkTheme
} from 'naive-ui'
import {SettingsOutline, Moon, Sunny} from '@vicons/ionicons5'
import {Subtract24Regular, Square24Regular, Dismiss24Regular} from '@vicons/fluent'
import AppMenu from '@/components/AppMenu.vue'

const router = useRouter()
const isDark = ref(false)
const isMaximized = ref(false)

// 头部样式计算属性
const headerStyle = computed(() => ({
  background: isDark.value
      ? 'linear-gradient(135deg, #101014 0%, #1a1a1a 100%)'
      : 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
}))

// 声明全局类型
declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
    }
  }
}

function toggleDark() {
  isDark.value = !isDark.value
}

// 跳转到首页
function goToHome() {
  console.log('点击了标题，准备跳转到首页')
  router.push({ name: 'Home' })
}

// 窗口控制函数
function minimizeWindow() {
  window.electronAPI?.minimize()
}

function maximizeWindow() {
  window.electronAPI?.maximize()
}

function closeWindow() {
  window.electronAPI?.close()
}

// 初始化窗口状态
onMounted(async () => {
  if (window.electronAPI) {
    isMaximized.value = await window.electronAPI.isMaximized()
    window.electronAPI.onMaximizeChange((maximized) => {
      isMaximized.value = maximized
    })
  }
})
</script>

<style scoped>
.titleBar {
  -webkit-app-region: drag; /* 使标题栏可拖拽 */
}

.custom-header {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
}

.no-drag {
  -webkit-app-region: no-drag; /* 按钮区域不可拖拽 */
}

.window-control-btn {
  -webkit-app-region: no-drag; /* 按钮区域不可拖拽 */
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.window-control-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 暗黑模式下的按钮hover效果 */
:deep(.n-config-provider[data-theme="dark"]) .window-control-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.close-btn:hover {
  background-color: #ff4d4f !important;
  color: white;
}

/* 确保按钮在拖拽区域内的点击事件正常工作 */
.no-drag :deep(.n-button__content),
.window-control-btn :deep(.n-button__content) {
  -webkit-app-region: no-drag;
}

/* 侧边栏调试样式 */
.sidebar-debug {
  background-color: #f5f5f5;
  min-height: 100%;
}
</style>
