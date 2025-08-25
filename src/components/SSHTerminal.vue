<template>
  <div class="ssh-terminal">
    <div class="terminal-header">
      <div class="connection-info">
        <span class="connection-status" :class="{ connected: isConnected }">
          {{ isConnected ? '已连接' : '未连接' }}
        </span>
        <span class="connection-details">{{ connectionDetails }}</span>
      </div>
      <div class="terminal-actions">
        <n-button size="small" @click="drawer()"  strong secondary type="info" :disabled="!isConnected">
          <template #icon>
            <n-icon class="title-icon"><AnalyticsOutline /></n-icon>
          </template>
          监控
        </n-button>
        <n-button size="small" @click="clearTerminal" strong secondary type="primary" :disabled="!isConnected">
          <template #icon>
            <n-icon><TrashOutline /></n-icon>
          </template>
          清屏
        </n-button>
        <n-button size="small" type="error" @click="disconnect" :disabled="!isConnected">
          <template #icon>
            <n-icon><CloseOutline /></n-icon>
          </template>
          断开
        </n-button>
      </div>
    </div>
    
    <div class="terminal-container">
      <div ref="terminalElement" class="terminal"  id="drawer-target"></div>
    </div>
    
    <div class="terminal-footer">
      <div class="status-bar">
        <span>行: {{ cursorPosition.row }}</span>
        <span>列: {{ cursorPosition.col }}</span>
        <span>连接数: {{ connectionCount }}</span>
      </div>
    </div>
    <n-drawer v-model:show="active" :width="400" placement="right"  to="#drawer-target">
      <n-drawer-content class="drawer-center">
          <SystemMonitor :connection-id="connectionId"/>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
// Vue & NaiveUI 基础导入
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { TrashOutline, CloseOutline, AnalyticsOutline } from '@vicons/ionicons5'

// xterm 相关
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

// 系统监控组件
import SystemMonitor from "@/components/SystemMonitor.vue";


// ------------ Props 定义 ------------
interface Props {
  connectionId?: string   // SSH 连接唯一ID
  serverInfo?: {          // 服务器基本信息
    host: string
    port: number
    username: string
  }
}

// 设置默认参数
const props = withDefaults(defineProps<Props>(), {
  connectionId: '',
  serverInfo: () => ({ host: '', port: 22, username: '' })
})

// ------------ emits 定义 ------------
const emit = defineEmits<{
  disconnect: []                 // 断开连接事件
  error: [message: string]       // 错误事件，传递错误信息
}>()


// ------------ 响应式变量 ------------
const terminalElement = ref<HTMLElement>()   // 终端 DOM 节点
const terminal = ref<Terminal>()             // xterm 实例
const fitAddon = ref<FitAddon>()             // 自适应大小插件
const isConnected = ref(false)               // 是否已连接
const connectionCount = ref(0)               // 当前 SSH 连接数量
const cursorPosition = ref({ row: 1, col: 1 }) // 光标位置
const active = ref(false)                    // 控制抽屉开关


// 动态显示服务器连接信息
const connectionDetails = computed(() => {
  if (!props.serverInfo) return ''
  return `${props.serverInfo.username}@${props.serverInfo.host}:${props.serverInfo.port}`
})

let resizeObserver: ResizeObserver | null = null


// ------------ 生命周期 ------------
onMounted(async () => {
  await nextTick()
  if (terminalElement.value) {
    initTerminal()         // 初始化终端
    setupResizeObserver()  // 监听窗口大小
  }
})

onUnmounted(() => {
  if (terminal) {
    terminal.value?.dispose()   // 销毁终端实例
  }
  if (resizeObserver) {
    resizeObserver.disconnect() // 取消监听
  }
})


// ------------ 终端初始化函数 ------------
function initTerminal() {
  if (!terminalElement.value) return

  // 创建终端实例
  terminal.value = new Terminal({
    cursorBlink: true,           // 光标闪烁
    theme: {                     // 终端配色
      background: '#1e1e1e',
      foreground: '#ffffff',
      cursor: '#ffffff',
      black: '#000000',
      red: '#e06c75',
      green: '#98c379',
      yellow: '#d19a66',
      blue: '#61afef',
      magenta: '#c678dd',
      cyan: '#56b6c2',
      white: '#ffffff',
      brightBlack: '#5c6370',
      brightRed: '#e06c75',
      brightGreen: '#98c379',
      brightYellow: '#d19a66',
      brightBlue: '#61afef',
      brightMagenta: '#c678dd',
      brightCyan: '#56b6c2',
      brightWhite: '#ffffff'
    },
    fontFamily: 'Consolas, "Courier New", monospace', // 字体
    fontSize: 14,
    lineHeight: 1.2,
    scrollback: 1000           // 滚动缓存行数
  })

  // 挂载插件
  fitAddon.value = new FitAddon()
  terminal.value.loadAddon(fitAddon.value)
  terminal.value.loadAddon(new WebLinksAddon())  // 链接识别插件

  // 挂载到页面
  terminal.value.open(terminalElement.value)
  fitAddon.value.fit()

  // 监听输入，发送到 SSH 连接
  terminal.value.onData((data) => {
    const info = window.electronAPI.executeSSHCommand(props.connectionId, data)
    console.log('Terminal input:', data)
    console.log('Terminal sout:', info)
  })

  // 监听光标移动，更新光标位置
  terminal.value.onCursorMove(() => {
    const pos = terminal.value?.buffer.active.cursorY
    if (pos !== undefined) {
      cursorPosition.value.row = pos + 1
      cursorPosition.value.col = (terminal.value?.buffer.active.cursorX || 0) + 1
    }
  })

  // 欢迎信息
  terminal.value.write('SSH终端已就绪\r\n')
  terminal.value.write('等待连接...\r\n')
}


// ------------ 窗口自适应 ------------
function setupResizeObserver() {
  if (!terminalElement.value) return

  resizeObserver = new ResizeObserver(() => {
    if (fitAddon.value) {
      fitAddon.value.fit()
    }
  })

  resizeObserver.observe(terminalElement.value)
}


// ------------ 建立连接 ------------
async function connect() {
  if (!props.connectionId || !terminal.value) return

  try {
    isConnected.value = true
    terminal.value.write('\r\n正在连接SSH...\r\n')

    // TODO: 调用 Electron 主进程的 SSH 连接逻辑
    terminal.value.write('SSH连接成功！\r\n')
    terminal.value.write('$ ')

   await window.electronAPI.createSSHShell()
    // 获取当前连接数
    connectionCount.value = await window.electronAPI.getSSHConnectionCount?.() || 0

  } catch (error) {
    isConnected.value = false
    const message = error instanceof Error ? error.message : '连接失败'
    terminal.value?.write(`\r\n连接失败: ${message}\r\n`)
    emit('error', message) // 通知父组件
  }
}


// ------------ 断开连接 ------------
async function disconnect() {
  if (!props.connectionId) return

  try {
    await window.electronAPI.disconnectSSH?.(props.connectionId)
    isConnected.value = false

    if (terminal.value) {
      terminal.value.write('\r\n已断开SSH连接\r\n')
      terminal.value.write('$ ')
    }

    emit('disconnect')
  } catch (error) {
    const message = error instanceof Error ? error.message : '断开连接失败'
    emit('error', message)
  }
}


// ------------ 工具方法 ------------
function clearTerminal() {
  if (terminal.value) {
    terminal.value.clear()
    terminal.value.write('$ ')
  }
}

function drawer() {
  active.value = true
}


// ------------ 监听 props.connectionId 变化 ------------
watch(() => props.connectionId, (newId) => {
  if (newId && !isConnected.value) {
    connect()  // 新连接ID时，自动尝试连接
  }
}, { immediate: true })


// ------------ 向父组件暴露方法 ------------
defineExpose({
  write: (data: string) => terminal.value?.write(data), // 写入数据到终端
  clear: clearTerminal,                                // 清屏
  connect,                                             // 连接方法
  disconnect                                           // 断开方法
})

</script>

<style scoped>
.ssh-terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}
.title-icon {
  color: #1890ff;
}
.drawer-center {
  display: flex;

}

.connection-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connection-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #dc3545;
  color: white;
}

.connection-status.connected {
  background: #28a745;
}

.connection-details {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  color: #e0e0e0;
}

.terminal-actions {
  display: flex;
  gap: 8px;
}

.terminal-container {
  flex: 1;
  padding: 16px;
  min-height: 0;
}

.terminal {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.terminal-footer {
  padding: 8px 16px;
  background: #2d2d2d;
  border-top: 1px solid #404040;
}

.status-bar {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #a0a0a0;
  font-family: 'Monaco', 'Menlo', monospace;
}

:deep(.xterm) {
  padding: 8px;
}

:deep(.xterm-viewport) {
  background: transparent !important;
}

:deep(.xterm-screen) {
  background: transparent !important;
}
</style>
