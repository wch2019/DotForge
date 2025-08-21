<template>
  <div class="editor-page">
    <div class="editor-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">
              <n-icon size="28" class="title-icon">
                <component :is="isEdit ? Edit24Regular : AddOutline"/>
              </n-icon>
              {{ isEdit ? '编辑服务器' : '新增服务器' }}
            </h1>
            <p class="page-subtitle">维护服务器连接信息与元数据</p>
          </div>
          <div class="header-actions">
            <n-button @click="onCancel" size="large" type="warning">
              <template #icon><n-icon><CloseOutline/></n-icon></template>
              取消
            </n-button>
            <n-button type="primary" size="large" @click="onSave" :loading="saving" :disabled="!canSave">
              <template #icon><n-icon><CheckmarkOutline/></n-icon></template>
              保存
            </n-button>
          </div>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="step-content">
        <n-form :model="form" label-placement="top" class="step-form">
          <div class="form-row">
            <n-form-item label="名称" path="name" required>
              <n-input v-model:value="form.name" placeholder="如 生产A机"/>
            </n-form-item>
            <n-form-item label="标签" path="tag">
              <n-select v-model:value="form.tag" placeholder="选择标签" :options="tags"/>
            </n-form-item>
          </div>

          <div class="form-row">
            <n-form-item label="主机地址" path="host" required>
              <n-input v-model:value="form.host" placeholder="如 192.168.1.10"/>
            </n-form-item>
            <n-form-item label="端口" path="port" required>
              <n-input-number v-model:value="form.port" :min="1" :max="65535"/>
            </n-form-item>
          </div>

          <div class="form-row">
            <n-form-item label="用户名" path="username" required>
              <n-input v-model:value="form.username" placeholder="SSH 用户名"/>
            </n-form-item>
            <n-form-item label="认证方式" path="authType">
              <n-radio-group v-model:value="form.authType">
                <n-radio value="password">密码</n-radio>
                <n-radio value="privateKey">私钥</n-radio>
              </n-radio-group>
            </n-form-item>
          </div>

          <div class="form-row">
            <div v-if="form.authType === 'password'">
              <n-form-item label="密码" path="password" required>
                <n-input v-model:value="form.password" type="password" placeholder="SSH 密码"/>
              </n-form-item>
            </div>
            <div v-if="form.authType === 'privateKey'">
              <n-form-item label="私钥路径" path="privateKeyPath" required>
                <n-input v-model:value="form.privateKeyPath" placeholder="如 C:/Users/me/.ssh/id_rsa"/>
              </n-form-item>
            </div>
            <n-form-item label="描述" path="description">
              <n-input v-model:value="form.description" placeholder="备注信息"/>
            </n-form-item>
          </div>

          <div class="form-row">
            <n-form-item label="连接测试" path="test">
              <n-button @click="testConnection" :loading="testing">
                <template #icon><n-icon><LinkOutline/></n-icon></template>
                测试连接
              </n-button>
              <span class="test-result" v-if="testResult">{{ testResult }}</span>
            </n-form-item>
          </div>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSelect
} from 'naive-ui'
import {
  AddOutline,
  CheckmarkOutline,
  CloseOutline,
  LinkOutline
} from '@vicons/ionicons5'
import {Edit24Regular} from '@vicons/fluent'

const router = useRouter()
const route = useRoute()
const id = route.query.id as string | undefined
const isEdit = computed(() => !!id)

type ServerForm = {
  id?: number
  name: string
  tag?: string
  host: string
  port: number
  username: string
  authType: 'password' | 'privateKey'
  password?: string
  privateKeyPath?: string
  description?: string
}

const tags = [
  { label: '生产', value: 'prod' },
  { label: '预发', value: 'stage' },
  { label: '测试', value: 'test' },
]

const form = ref<ServerForm>({
  name: '',
  tag: undefined,
  host: '',
  port: 22,
  username: '',
  authType: 'password',
  password: '',
  privateKeyPath: ''
})

const saving = ref(false)
const testing = ref(false)
const testResult = ref('')

onMounted(async () => {
  if (isEdit.value && id) {
    const data = await window.electronAPI.getServerById?.(parseInt(id))
    if (data) Object.assign(form.value, data)
  }
})

const canSave = computed(() => {
  if (!form.value.name || !form.value.host || !form.value.port || !form.value.username) return false
  if (form.value.authType === 'password') return !!form.value.password
  if (form.value.authType === 'privateKey') return !!form.value.privateKeyPath
  return true
})

function onCancel() {
  router.push({ name: 'Server' })
}

async function onSave() {
  if (!canSave.value) return
  saving.value = true
  try {
    const plain = JSON.parse(JSON.stringify(form.value))
    if (isEdit.value && id) {
      await window.electronAPI.updateServer?.(parseInt(id), plain)
    } else {
      await window.electronAPI.createServer?.(plain)
    }
    router.push({ name: 'Server' })
  } finally {
    saving.value = false
  }
}

async function testConnection() {
  testing.value = true
  testResult.value = ''
  try {
    const ok = await window.electronAPI.testServerConnection?.(JSON.parse(JSON.stringify(form.value)))
    testResult.value = ok ? '连接成功' : '连接失败'
  } catch (e) {
    testResult.value = '连接失败'
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.editor-page { background: var(--content-bg); min-height: var(--content-height); padding: 24px; }
.editor-container { max-width: 900px; margin: 0 auto; }

.page-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 32px; margin-bottom: 24px; color: white; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.header-left { flex: 1; }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 8px 0; display: flex; align-items: center; gap: 12px; }
.title-icon { color: #ffd700; }
.page-subtitle { font-size: 16px; opacity: .9; margin: 0; }
.header-actions { display: flex; gap: 12px; }

.step-content { background: var(--content-bg); border: 1px solid var(--n-border-color); border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.step-form { max-width: 800px; margin: 0 auto; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.form-row:last-child { margin-bottom: 0; }
.test-result { margin-left: 12px; color: #6b7280; }

@media (max-width: 768px) {
  .editor-page { padding: 16px; }
  .header-content { flex-direction: column; gap: 20px; text-align: center; }
  .page-title { font-size: 24px; }
  .form-row { grid-template-columns: 1fr; }
}
</style>


