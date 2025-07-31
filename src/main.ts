import { createApp } from 'vue'
import '@/style/style.css'
import '@/style/tailwind.css';
import App from './App.vue'
import { createPinia } from 'pinia'
import router from '@/router/index'
import naive from 'naive-ui'

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.use(naive)

app.mount('#app').$nextTick(() => {
  // 使用 contextBridge 暴露的 ipcRenderer 来监听主进程发来的消息
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
