import {RouteRecordRaw} from 'vue-router'
import { MenuOption } from 'naive-ui'
import {h} from "vue"
import {
  HomeOutline,
  FolderOutline,
  SettingsOutline
} from '@vicons/ionicons5'

// 图标映射
const iconMap: Record<string, any> = {
  HomeOutline,
  FolderOutline,
  SettingsOutline
}

export function routesToMenuOptions(routes: RouteRecordRaw[]): MenuOption[] {
    return routes
        .filter(route => route.meta?.showInMenu !== false) // 过滤掉不显示在菜单中的路由
        .map(route => {
            const iconName = route.meta?.icon as string
            const IconComponent = iconMap[iconName]
            
            return {
                label: route.meta?.title as string,
                key: route.name as string,
                icon: IconComponent ? () => h(IconComponent) : undefined
            }
        })
}

