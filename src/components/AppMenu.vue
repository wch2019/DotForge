<template>
  <div class="sidebar-container">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="header-content">
        <div class="app-info">
          <img src="/dot-forge.png" alt="App Icon" class="app-icon" />
          <div class="app-details">
            <h3 class="app-name">DotForge</h3>
            <p class="app-version">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>

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

function showHelp() {
  console.log('显示帮助')
}
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
}

/* 侧边栏头部 */
.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.app-details {
  flex: 1;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.app-version {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
  line-height: 1.2;
}

/* 菜单区域 */
.menu-section {
  flex: 1;
  padding: 16px 0;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 16px 8px 16px;
  margin-bottom: 8px;
}

.custom-menu {
  border: none;
  background: transparent;
}

/* 快速操作 */
.quick-actions {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.5);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  justify-content: flex-start;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.8);
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
  background-color: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.status-text {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 4px;
}

/* 菜单项样式覆盖 */
:deep(.n-menu-item) {
  margin: 2px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.n-menu-item:hover) {
  background-color: rgba(102, 126, 234, 0.1);
}

:deep(.n-menu-item--selected) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

:deep(.n-menu-item--selected:hover) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

:deep(.n-menu-item-content) {
  padding: 12px 16px;
  font-weight: 500;
}

:deep(.n-menu-item-content__icon) {
  margin-right: 12px;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-container {
    width: 100%;
  }
  
  .app-name {
    font-size: 14px;
  }
  
  .app-version {
    font-size: 11px;
  }
}
</style>
