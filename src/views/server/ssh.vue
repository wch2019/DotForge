<template>
  <div class="ssh-page">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <SSHTerminal
          class="content-layout"
          ref="terminalRef"
          :connection-id="currentConnectionId"
          :server-info="currentServer"
          @disconnect="handleDisconnect"
          @error="handleError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import SSHTerminal from '@/components/SSHTerminal.vue'

const route = useRoute()
const router = useRouter()

// 状态管理
const currentServer = ref<any>(null)
const currentConnectionId = ref<string>('')
const isConnected = ref(false)


// 组件引用
const terminalRef = ref()

onMounted(async () => {
  const serverId = route.query.serverId as string
  if (serverId) {
    const server = await window.electronAPI.getServerById(serverId)
    if (server) {
      await connectServer(server)
    }
  }
})

async function connectServer(server: any) {
  currentServer.value = server

  try {
    // 建立SSH连接
    const config = {
      host: server.host,
      port: server.port,
      username: server.username,
      password: server.authType === 'password' ? server.password : undefined,
      privateKeyPath: server.authType === 'privateKey' ? server.privateKeyPath : undefined
    }

    const connectionId = await window.electronAPI.connectSSH?.(config)
    if (connectionId) {
      currentConnectionId.value = connectionId
      isConnected.value = true
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '连接失败'
    window.$message?.error(`SSH连接失败: ${message}`)
  }
}

async function disconnectCurrent() {
  if (currentConnectionId.value) {
    try {
      await window.electronAPI.disconnectSSH?.(currentConnectionId.value)
      currentConnectionId.value = ''
      currentServer.value = null
      isConnected.value = false

      window.$message?.success('已断开SSH连接')
    } catch (error) {
      const message = error instanceof Error ? error.message : '断开连接失败'
      window.$message?.error(`断开连接失败: ${message}`)
    }
  }
}

function handleDisconnect() {
  currentConnectionId.value = ''
  currentServer.value = null
  isConnected.value = false
}

function handleError(message: string) {
  window.$message?.error(message)
}

// 返回
function goBack() {
  router.back()
}

// 暴露方法给父组件
defineExpose({
  disconnect: disconnectCurrent
})
</script>

<style scoped>
.ssh-page {
  padding: 24px;
  background: var(--content-bg);
  min-height: var(--content-height);
}


.main-content {
  height: calc(100vh - 100px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

}

@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .ssh-page {
    padding: 16px;
  }

  .content-layout {
    gap: 16px;
  }
}
</style>
