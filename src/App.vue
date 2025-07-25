<template>
  <n-config-provider :theme="isDark ? darkTheme : null">
    <n-layout style="height: 100vh">
      <n-layout-header bordered>
        <div class="flex items-center justify-between h-12 px-6">
          <div>CI/CD 桌面工具</div>
          <div class="flex items-center gap-2">
            <n-button quaternary circle size="small">
              <template #icon>
                <n-icon>
                  <SettingsOutline/>
                </n-icon>
              </template>
            </n-button>
            <n-button quaternary circle size="small" @click="toggleDark">
              <template #icon>
                <n-icon>
                  <component :is="isDark ? Moon : Sunny"/>
                </n-icon>
              </template>
            </n-button>
          </div>
        </div>
      </n-layout-header>
      <n-layout has-sider style="height: calc(100vh - 49px);">
        <n-layout-sider width="192" bordered >
          <AppMenu />
        </n-layout-sider>
        <n-layout-content style="padding: 16px;">
          <router-view/>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import {ref} from 'vue'
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
import AppMenu from '@/components/AppMenu.vue'

const isDark = ref(false)

function toggleDark() {
  isDark.value = !isDark.value
}
</script>

<style scoped>
/* 可根据需要添加自定义样式 */
</style>
