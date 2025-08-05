<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput, NButton } from 'naive-ui'

interface Props {
  modelValue: string
  type?: 'file' | 'directory'
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const path = ref(props.modelValue)

watch(
    () => props.modelValue,
    val => (path.value = val)
)

async function handleSelectPath() {
  const selected = await window.electronAPI.selectPath(props.type)

  if (selected) {
    path.value = selected
    emit('update:modelValue', selected)
  }
}
</script>

<template>
  <n-input-group>
    <n-input v-model:value="path" :placeholder="placeholder" readonly />
    <n-button type="primary" @click="handleSelectPath">选择路径</n-button>
  </n-input-group>
</template>

<style scoped>

</style>
