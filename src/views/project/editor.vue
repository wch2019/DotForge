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
              {{ isEdit ? '编辑项目' : '新建项目' }}
            </h1>
            <p class="page-subtitle">配置您的CI/CD项目，支持多种构建方式</p>
          </div>
          <div class="header-actions">
            <n-button @click="onCancel" size="large" type="warning">
              <template #icon>
                <n-icon>
                  <CloseOutline/>
                </n-icon>
              </template>
              取消
            </n-button>
            <n-button
                type="primary"
                size="large"
                @click="onSave"
                :loading="saving"
                :disabled="!canSave"
            >
              <template #icon>
                <n-icon>
                  <CheckmarkOutline/>
                </n-icon>
              </template>
              保存项目
            </n-button>
          </div>
        </div>
      </div>

      <!-- 步骤导航 -->
      <div class="steps-section">
        <n-steps
            :current="currentStep"
            :status="stepsStatus"
            class="custom-steps"
        >
          <n-step
              v-for="(step, index) in steps"
              :key="index"
              :title="step.title"
          />
        </n-steps>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">

        <!-- 步骤1: 基础信息 -->
        <div v-show="currentStep === 1" class="step-panel">
          <n-form :model="form" :rules="basicRules" label-placement="top" class="step-form">
            <n-form-item label="项目名称" path="name" required>
              <n-input v-model:value="form.name" placeholder="请输入项目名称"/>
            </n-form-item>
            <n-form-item label="项目标签" path="tags">
              <n-select v-model:value="form.tag" placeholder="选择项目标签" :options="tags"/>
            </n-form-item>
            <n-form-item label="项目路径" path="localPath" required>
              <FilePicker
                  v-model="form.localPath"
                  type="directory"
                  placeholder="请选择项目路径"
              />
            </n-form-item>
            <n-form-item label="项目描述" path="description">
              <n-input v-model:value="form.description" placeholder="请输入项目描述"/>
            </n-form-item>
          </n-form>
        </div>

        <!-- 步骤2: 构建流程 -->
        <div v-show="currentStep === 2" class="step-panel">
          <n-form :model="form" :rules="buildRules" label-placement="top" class="step-form">

            <n-form-item label="构建命令" path="buildCmd" required>
              <n-input v-model:value="form.buildCmd" type="textarea" rows="10" placeholder="如 mvn clean package.多行命令请用换行分隔"/>
            </n-form-item>

            <n-form-item label="构建输出目录" path="outputDir" required>
              <n-input v-model:value="form.outputDir" placeholder="如 target、dist、build"/>
            </n-form-item>
          </n-form>
        </div>

        <!-- 步骤3: 发布操作 -->
        <div v-show="currentStep === 3" class="step-panel">
          <n-form :model="form" :rules="deployRules" label-placement="top" class="step-form">
            <n-form-item label="发布方式" path="deployMethod">
              <n-radio-group v-model:value="form.deployMethod">
                <n-radio v-for="method in deployMethods" :key="method.value" :value="method.value">{{
                    method.label
                  }}
                </n-radio>
              </n-radio-group>
            </n-form-item>

            <!-- 不发布 -->
            <div v-if="form.deployMethod === 'none'" class="deploy-section">
              <n-alert type="info" :show-icon="false">
                <template #header>
                  <n-icon>
                    <InformationCircleOutline/>
                  </n-icon>
                  不发布
                </template>
                构建完成后不进行发布操作
              </n-alert>
            </div>

            <!-- 本地命令 -->
            <div v-if="form.deployMethod === 'local'" class="deploy-section">
              <n-form-item label="执行命令" path="localCommand">
                <n-input v-model:value="form.localCommand" type="textarea" rows="6" placeholder="输入要执行的命令"/>
              </n-form-item>
            </div>

            <!-- Docker 镜像 -->
            <div v-if="form.deployMethod === 'docker'" class="deploy-section">
              <div class="form-row">
                <n-form-item label="Dockerfile 路径" path="dockerfilePath">
                  <n-input v-model:value="form.dockerfilePath" placeholder="如 ./Dockerfile"/>
                </n-form-item>
                <n-form-item label="镜像名称" path="imageName">
                  <n-input v-model:value="form.imageName" placeholder="如 myapp:latest"/>
                </n-form-item>
              </div>

              <div class="form-row">
                <n-form-item label="发布方式" path="dockerDeployType">
                  <n-radio-group v-model:value="form.dockerDeployType">
                    <n-radio value="local">本地运行</n-radio>
                    <n-radio value="push">推送镜像</n-radio>
                  </n-radio-group>
                </n-form-item>
                <div v-if="form.dockerDeployType === 'local'">
                  <n-form-item label="运行命令" path="dockerRunCommand">
                    <n-input v-model:value="form.dockerRunCommand" type="textarea" rows="2"
                             placeholder="如 docker run -p 8080:8080 myapp:latest"/>
                  </n-form-item>
                </div>

                <div v-if="form.dockerDeployType === 'push'">
                  <n-form-item label="镜像仓库地址" path="registry">
                    <n-input v-model:value="form.registry" type="textarea" rows="2"
                             placeholder="如 registry.example.com"/>
                  </n-form-item>
                </div>
              </div>


            </div>

            <!-- 远程服务器 -->
            <div v-if="form.deployMethod === 'remote'" class="deploy-section">
              <div class="form-row">
                <n-form-item label="服务器地址" path="serverAddress">
                  <n-input v-model:value="form.serverAddress" placeholder="如 192.168.1.10"/>
                </n-form-item>
                <n-form-item label="端口" path="serverPort">
                  <n-input-number v-model:value="form.serverPort" :min="1" :max="65535"/>
                </n-form-item>
              </div>

              <div class="form-row">
                <n-form-item label="用户名" path="serverUsername">
                  <n-input v-model:value="form.serverUsername" placeholder="SSH 用户名"/>
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
                  <n-form-item label="密码" path="serverPassword">
                    <n-input v-model:value="form.serverPassword" type="password" placeholder="SSH 密码"/>
                  </n-form-item>
                </div>

                <div v-if="form.authType === 'privateKey'">
                  <n-form-item label="私钥路径" path="privateKeyPath">
                    <n-input v-model:value="form.privateKeyPath" placeholder="私钥文件路径"/>
                  </n-form-item>
                </div>

                <n-form-item label="目标路径" path="targetPath">
                  <n-input v-model:value="form.targetPath" placeholder="上传产物路径"/>
                </n-form-item>
              </div>

              <n-form-item label="上传后执行命令" path="remoteCommand">
                <n-input v-model:value="form.remoteCommand" type="textarea" rows="3" placeholder="上传后要执行的命令"/>
              </n-form-item>
            </div>
          </n-form>
        </div>

        <!-- 步骤4: 其他配置 -->
        <div v-show="currentStep === 4" class="step-panel">
          <!-- <div class="step-header">
            <h2 class="step-title">其他配置</h2>
            <p class="step-description">配置项目的其他设置</p>
          </div> -->

          <n-form :model="form" label-placement="top" class="step-form">
            <div class="form-row">
              <n-form-item label="保留产物" path="keepArtifacts">
                <n-switch v-model:value="form.keepArtifacts" :checked-value="1" :unchecked-value="0"/>
                <span class="switch-label">保留构建产物</span>
              </n-form-item>
            </div>

            <div v-if="form.keepArtifacts" class="form-row">
              <n-form-item label="保留路径" path="keepPath">
                <n-input v-model:value="form.keepPath" placeholder="产物保留路径，留空使用默认路径"/>
              </n-form-item>
              <n-form-item label="保留个数" path="keepCount">
                <n-input-number v-model:value="form.keepCount" :min="1" :max="100"/>
                <span class="unit-text">个</span>
              </n-form-item>
            </div>
          </n-form>
        </div>
      </div>

      <!-- 步骤操作按钮 -->
      <div class="step-actions">
        <n-button
            v-if="currentStep > 1"
            @click="prevStep"
            size="large"
        >
          <template #icon>
            <n-icon>
              <ChevronBackOutline/>
            </n-icon>
          </template>
          上一步
        </n-button>

        <div class="step-actions-right">
          <n-button
              v-if="currentStep < steps.length"
              @click="nextStep"
              type="primary"
              size="large"
              :disabled="!canGoNext"
          >
            下一步
            <template #icon>
              <n-icon>
                <ChevronForwardOutline/>
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, toRaw} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSelect,
  NStep,
  NSteps,
  NSwitch,
  useMessage
} from 'naive-ui'
import {
  AddOutline,
  CheckmarkOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
  CloseOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'
import {Edit24Regular} from '@vicons/fluent'

import FilePicker from "@/components/FilePicker.vue";
import {defaultProjectData} from "../../types/project.ts";

const message = useMessage()
const router = useRouter()
const route = useRoute()
const id = route.query.id as string | undefined
const isEdit = computed(() => !!id)

// 当前步骤
const currentStep = ref(1)
const saving = ref(false)

// 步骤定义
const steps = [
  {title: '基础信息', description: '项目基本信息'},
  {title: '构建流程', description: '配置构建流程'},
  {title: '发布操作', description: '配置发布方式'},
  {title: '其他配置', description: '其他设置'}
]

// 发布方式选项
const deployMethods = [
  {label: '不发布', value: 'none'},
  {label: '本地命令', value: 'local'},
  {label: 'Docker镜像', value: 'docker'},
  {label: '远程服务器', value: 'remote'},
]

const tags = [
  {label: 'Java', value: 'java'},
  {label: 'Node', value: 'node'},
  {label: 'Python', value: 'python'},
  {label: 'Go', value: 'go'},
]

// 表单数据
const form = ref({...defaultProjectData});

// 表单验证规则
const basicRules = {
  name: [{required: true, message: '请输入项目名称', trigger: 'blur'}],
  localPath: [{required: true, message: '请选择本地路径', trigger: 'blur'}]
}

const buildRules = {
  buildCmd: [{required: true, message: '请输入构建命令', trigger: 'blur'}],
  outputDir: [{required: true, message: '请输入构建输出目录', trigger: 'blur'}]
}

const deployRules = {
  imageName: [{required: true, message: '请输入镜像名称', trigger: 'blur'}]
}

// 计算属性
const stepsStatus = computed(() => {
  if (currentStep.value === steps.length - 1) return 'finish'
  return 'process'
})

const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.value.name && form.value.localPath
    case 2:
      return form.value.buildCmd && form.value.outputDir
    case 3:
      return form.value.deployMethod
    default:
      return true
  }
})

const canSave = computed(() => {
  return form.value.name && form.value.localPath && form.value.buildCmd && form.value.outputDir
})

// 下一步
function nextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

// 上一步
function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

onMounted(async () => {
  if (isEdit.value && id) {
    const project = await window.electronAPI.getProjectById(id)
    if (project) {
      Object.assign(form.value, project)
    }
  }
})

function onCancel() {
  router.push({name: 'Project'})
}

async function onSave() {
  if (!form.value.name || !form.value.localPath) return
  const plainData = JSON.parse(JSON.stringify(toRaw(form.value)))
  console.log('plainData', plainData)
  try {
    if (isEdit.value && id) {
      await window.electronAPI.updateProject(parseInt(id), plainData);
    } else {
      await window.electronAPI.createProject(plainData);
    }
    message.success('项目保存成功');
    router.push({name: 'Project'})
  } catch (error) {
    console.error('保存项目失败:', error)
    message.error('保存项目失败，请重试');
  }
}
</script>

<style scoped>
.editor-page {
  background: var(--content-bg);
  min-height: var(--content-height);
  padding: 24px;
}

.editor-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #ffd700;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 步骤导航 */
.steps-section {
  background: var(--content-bg);
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-steps {
  --n-step-header-font-size: 16px;
  --n-step-description-font-size: 14px;
}

/* 步骤内容 */
.step-content {
  background: var(--content-bg);
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 450px;
}

.step-panel {
  height: 100%;
}

/* 表单样式 */
.step-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.unit-text {
  font-size: 14px;
  color: #6b7280;
  margin-left: 8px;
}

.switch-label {
  font-size: 14px;
  color: #374151;
  margin-left: 8px;
}

/* 发布操作样式 */
.deploy-section {
  min-height: 230px;
  margin-top: 10px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
}

.dark .deploy-section {
  background: var(--content-bg);
}

.deploy-section .form-row {
  margin-bottom: 16px;
}

.deploy-section .form-row:last-child {
  margin-bottom: 0;
}

/* 步骤操作按钮 */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--content-bg);
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-actions-right {
  display: flex;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-page {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .page-title {
    font-size: 24px;
  }

  .build-methods {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .step-actions {
    flex-direction: column;
    gap: 16px;
  }

  .step-content {
    padding: 24px 16px;
  }
}
</style>
