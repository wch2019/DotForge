<template>
  <n-config-provider :theme="themeStore.naiveTheme">
    <n-layout style="height: 100vh">
      <n-layout-header bordered class="titleBar custom-header">
        <div class="flex items-center justify-between h-12 px-3">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity no-drag" @click="goToHome">
              <img src="/dot-forge.png" alt="App Icon" class="w-6 h-6"/>
              <span class="font-bold text-lg">DotForge</span>
            </div>
          </div>
          <div class="flex items-center gap-2 no-drag">
            <n-button quaternary circle @click="cycleTheme">
              <template #icon>
                <n-icon>
                  <component :is="currentIcon"/>
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
        <n-layout-sider width="160" bordered>
          <AppMenu/>
        </n-layout-sider>
        <n-layout-content >
          <router-view/>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import { Moon, Sunny, Contrast} from '@vicons/ionicons5'
import {Subtract24Regular, Square24Regular, Dismiss24Regular} from '@vicons/fluent'
import AppMenu from '@/components/AppMenu.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
themeStore.initThemeFromConfig()

const router = useRouter()


// 图标根据当前主题变化
const currentIcon = computed(() => {
  switch (themeStore.userTheme) {
    case 'light': return Sunny
    case 'dark': return Moon
    case 'auto': return Contrast
  }
})

// 循环切换主题
function cycleTheme() {
  const next = {
    light: 'dark',
    dark: 'auto',
    auto: 'light',
  } as const

  themeStore.setTheme(next[themeStore.userTheme])
}

function goToHome() {
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

</script>

<style scoped>
.titleBar {
  -webkit-app-region: drag; /* 使标题栏可拖拽 */
}

.custom-header {
  background: var(--header-bg);
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
</style>
