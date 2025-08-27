<template>
  <div class="flex flex-col gap-2">
    <div v-for="(path, index) in paths" :key="index" class="flex gap-2 items-center">
      <n-input
          v-model:value="paths[index]"
          placeholder="请输入路径"
          class="flex-1"
      />
      <n-button size="small" type="error" @click="removePath(index)">删除</n-button>
    </div>
    <n-button size="small" type="primary" @click="addPath">新增路径</n-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput, NButton } from 'naive-ui'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 内部数组表示
const paths = ref<string[]>(props.modelValue ? props.modelValue.split(',') : [])

// 外部更新时同步
watch(
    () => props.modelValue,
    (val) => {
      paths.value = val ? val.split(',') : []
    }
)

// 内部更新时拼接回字符串
watch(
    paths,
    (val) => {
      emit('update:modelValue', val.filter(Boolean).join(','))
    },
    { deep: true }
)

const addPath = () => {
  paths.value.push('')
}
const removePath = (index: number) => {
  paths.value.splice(index, 1)
}
</script>
