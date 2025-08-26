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
        <n-button size="small" @click="drawer()" strong secondary type="info" :disabled="!isConnected">
          <template #icon>
            <n-icon class="title-icon">
              <AnalyticsOutline/>
            </n-icon>
          </template>
          监控
        </n-button>
        <n-button size="small" @click="clearTerminal" strong secondary type="primary" :disabled="!isConnected">
          <template #icon>
            <n-icon>
              <TrashOutline/>
            </n-icon>
          </template>
          清屏
        </n-button>
        <n-button size="small" type="error" @click="disconnect" :disabled="!isConnected">
          <template #icon>
            <n-icon>
              <CloseOutline/>
            </n-icon>
          </template>
          断开
        </n-button>
      </div>
    </div>

    <div class="terminal-container">
      <div ref="terminalElement" class="terminal" id="drawer-target"></div>
    </div>

    <div class="terminal-footer">
      <div class="status-bar">
        <div class="system-info">
          <span>行: {{ cursorPosition.row }}</span>
          <span>列: {{ cursorPosition.col }}</span>
          <span>连接数: {{ connectionCount }}</span>
        </div>
        <div class="system-info" v-if="systemInfo">
          <span>CPU: {{ systemInfo.cpu.usage }}%</span>
          <span>内存: {{ systemInfo.memory.usage }}%</span>
          <span>交换: {{ systemInfo.swap.usage }}%</span>
        </div>

      </div>
    </div>
    <n-drawer v-model:show="active" :width="400" placement="right" to="#drawer-target">
      <n-drawer-content class="drawer-center">
        <SystemMonitor :connection-id="connectionId"/>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
// Vue & NaiveUI 基础导入
import {ref, onMounted, onUnmounted, nextTick, watch, computed} from 'vue'
import {NButton, NIcon} from 'naive-ui'
import {TrashOutline, CloseOutline, AnalyticsOutline} from '@vicons/ionicons5'

// xterm 相关
import {Terminal} from '@xterm/xterm'
import {FitAddon} from '@xterm/addon-fit'
import {WebLinksAddon} from '@xterm/addon-web-links'
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
  serverInfo: () => ({host: '', port: 22, username: ''})
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
const cursorPosition = ref({row: 1, col: 1}) // 光标位置
const active = ref(false)                    // 控制抽屉开关

// 系统信息（用于底部栏展示）
interface FooterSystemInfo {
  cpu: { usage: number }
  memory: { usage: number }
  swap: { usage: number }
}
const systemInfo = ref<FooterSystemInfo | null>(null)
let sysInfoTimer: ReturnType<typeof setInterval> | null = null

// 事件解绑集合，避免重复监听与内存泄露
const sshUnsubscribeFns: Array<() => void> = []
// 防重复销毁标记
let hasDestroyedTerminal = false


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
  destroyTerminal()
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
    console.log('Terminal input:', data)
    if(!isConnected.value){
      connect()
    }
  })

  // 监听光标移动，更新光标位置
  terminal.value.onCursorMove(() => {
    const pos = terminal.value?.buffer.active.cursorY
    if (pos !== undefined) {
      cursorPosition.value.row = pos + 1
      cursorPosition.value.col = (terminal.value?.buffer.active.cursorX || 0) + 1
    }
  })
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
    terminal.value.write('正在连接...\r\n')
    await sshShell()
    terminal.value.write('连接成功\r\n')
    // 获取当前连接数
    connectionCount.value = await window.electronAPI.getSSHConnectionCount?.() || 0
    // 启动底部系统信息定时刷新
    startSystemInfoTimer()

  } catch (error) {
    isConnected.value = false
    const message = error instanceof Error ? error.message : '连接失败'
    terminal.value?.write(`\r\n连接失败: ${message}\r\n`)
    emit('error', message) // 通知父组件
  }
}

/** 创建 SSH Shell */
async function sshShell() {
  if (props.connectionId) {
    const connectionId = props.connectionId

    window.electronAPI.ssh.createShell(connectionId).then(() => {
      // 接收远程输出
      const offData = window.electronAPI.ssh.on(`ssh:data:${connectionId}`, (data: string) => {
        terminal.value?.write(data)
      })

      const offClose = window.electronAPI.ssh.on(`ssh:close:${connectionId}`, () => {
        terminal.value?.write('\r\n*** SSH 已断开 ***\r\n')
      })

      // 输入 -> 发送到 SSH
      const disposeInput = terminal.value?.onData((input) => {
        window.electronAPI.ssh.send(`ssh:input:${connectionId}`, input)
      })

      // 记录解绑/释放函数
      sshUnsubscribeFns.push(
        offData,
        offClose,
        () => disposeInput?.dispose()
      )
    }).catch((err: unknown) => {
      terminal.value?.write(`\r\nSSH Shell 创建失败: ${String(err)}\r\n`)
      emit('error', err instanceof Error ? err.message : String(err))
    })
  }
}


// ------------ 断开连接 ------------
async function disconnect() {
  if (!props.connectionId) return

  try {
    await window.electronAPI.disconnectSSH?.(props.connectionId)
    isConnected.value = false
    // 停止底部系统信息刷新
    stopSystemInfoTimer()
    // 安全销毁终端
    destroyTerminal()

    if (terminal.value) {
      terminal.value.write('\r\n已断开SSH连接\r\n')
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
  }
}

function drawer() {
  active.value = true
}

// ----------- 底部栏系统信息刷新 ------------
function startSystemInfoTimer() {
  stopSystemInfoTimer()
  if (!props.connectionId) return
  // 立即拉一次
  refreshSystemInfo()
  sysInfoTimer = setInterval(refreshSystemInfo, 5000)
}

function stopSystemInfoTimer() {
  if (sysInfoTimer) {
    clearInterval(sysInfoTimer)
    sysInfoTimer = null
  }
}

// 获取系统信息
async function refreshSystemInfo() {
  if (!props.connectionId) return
  try {
    const info = await window.electronAPI.getSSHSystemInfo?.(props.connectionId)
    if (info) {
      systemInfo.value = {
        cpu: { usage: info.cpu?.usage ?? 0 },
        memory: { usage: info.memory?.usage ?? 0 },
        swap: { usage: info.swap?.usage ?? 0 },
      }
    }
  } catch (e) {
    // 忽略底部展示错误
  }
}

// ------------ 销毁终端（防重复） ------------
function destroyTerminal() {
  if (hasDestroyedTerminal) return
  hasDestroyedTerminal = true

  // 停止系统信息刷新
  stopSystemInfoTimer()

  // 解绑 SSH 监听
  while (sshUnsubscribeFns.length) {
    const off = sshUnsubscribeFns.pop()
    try { off && off() } catch {}
  }

  // 停止尺寸监听优先于终端销毁
  if (resizeObserver) {
    try { resizeObserver.disconnect() } catch {}
    resizeObserver = null
  }

  // 安全销毁终端与插件
  try {
    terminal.value?.dispose()
  } catch {}
  terminal.value = undefined
  fitAddon.value = undefined
}


// ------------ 监听 props.connectionId 变化 ------------
watch(() => props.connectionId, (newId) => {
  if (newId && !isConnected.value) {
    connect()  // 新连接ID时，自动尝试连接
  }
}, {immediate: true})


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
  padding: 0 10px 0 10px;
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
  font-size: 12px;
  color: #a0a0a0;
  font-family: 'Monaco', 'Menlo', monospace;
  justify-content: space-between;

  .system-info{
    display: flex;
    gap: 16px;
  }
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
