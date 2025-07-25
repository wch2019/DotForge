import { createApp } from 'vue'
import '@/style/style.css'
import '@/style/tailwind.css';
import App from './App.vue'
// 挂载路由配置
import router from '@/router/index'


const app = createApp(App)
app.use(router)

app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
