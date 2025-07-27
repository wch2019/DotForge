<template>
  <div class="sidebar-container">
    <!-- 导航菜单 -->
    <div class="menu-section">
      <div class="section-title">导航</div>
      <n-menu
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
        class="custom-menu"
      />
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <div class="section-title">快速操作</div>
      <div class="action-buttons">
        <n-button quaternary size="small" class="action-btn" @click="quickAdd">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          新建项目
        </n-button>
        <n-button quaternary size="small" class="action-btn" @click="quickBuild">
          <template #icon>
            <n-icon><PlayOutline /></n-icon>
          </template>
          快速构建
        </n-button>
        <n-button quaternary size="small" class="action-btn" @click="openSettings">
          <template #icon>
            <n-icon><SettingsOutline /></n-icon>
          </template>
          应用设置
        </n-button>
      </div>
    </div>

    <!-- 侧边栏底部 -->
    <div class="sidebar-footer">
      <div class="footer-content">
        <div class="status-indicator">
          <div class="status-dot online"></div>
          <span class="status-text">系统正常</span>
        </div>
        <div class="footer-actions">
          <n-button quaternary circle size="small" @click="showHelp">
            <template #icon>
              <n-icon><HelpCircleOutline /></n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {NMenu, NButton, NIcon} from 'naive-ui'
import {routes} from '@/router'
import {routesToMenuOptions} from '@/utils/routes-to-menu'
import {
  AddOutline,
  PlayOutline,
  SettingsOutline,
  HelpCircleOutline
} from '@vicons/ionicons5'


const router = useRouter()
const route = useRoute()

// 生成菜单选项
const menuOptions = routesToMenuOptions(routes)

// 当前激活的菜单项
const activeKey = computed(() => route.name as string)

// 处理菜单选择
function handleMenuSelect(key: string) {
  router.push({ name: key })
}

// 快速操作函数
function quickAdd() {
  router.push({ name: 'Project' })
}

function quickBuild() {
  console.log('快速构建')
}

function openSettings() {
  router.push({ name: 'Setting' })
}

function showHelp() {
  console.log('显示帮助')
}
</script>

<style scoped>
.sidebar-container {
  min-height: 100%;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 菜单区域 */
.menu-section {
  flex: 1;
  padding: 16px 0;
}

.section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  color: var(--n-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 16px 8px 16px;
  margin-bottom: 8px;
}

/* 快速操作 */
.quick-actions {
  padding: 16px;
  border-top: 1px solid var(--n-border-color);
  background: var(--quick-actions);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--n-border-color);
  background: var(--quick-actions);
}


.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.online {
  background-color: var(--color-green-500);
  box-shadow: 0 0 0 0 var(--color-green-500);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 var(--color-green-500);
  }
  70% {
    box-shadow: 0 0 0 6px transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
}

.status-text {
  font-size: var(--text-sm);
  color: var(--n-text-color);
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 4px;
}

</style>
