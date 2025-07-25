<template #1>
  <n-menu
      :options="menuOptions"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { routes } from '@/router'
import {convertRoutesToMenuOptions, routesToMenuOptions} from '@/utils/routes-to-menu'

const router = useRouter()
const route = useRoute()

const menuOptions = routesToMenuOptions(routes)
console.log(menuOptions)
// const activeKey = ref(route.name as string)
// console.log(activeKey)
//
// watch(route, () => {
//   activeKey.value = route.name as string
// })
//
// function handleSelect(key: string) {
//   router.push({ name: key })
// }
</script>
