import {RouteRecordRaw, RouterLink} from 'vue-router'
import { MenuOption } from 'naive-ui'
import {h} from "vue";

export function routesToMenuOptions(routes: RouteRecordRaw[]): MenuOption[] {
    return routes.map(route => {
        console.log('route11111',route)
            return {
                label: route.meta!.title,
                key: route.name,
                icon: () => h('span', {class: route.meta?.icon})
            }
        })
}

export function convertRoutesToMenuOptions(routes: RouteRecordRaw[]): MenuOption[] {
    return routes.map(route => {
        return {
            label: () =>
                h(
                    RouterLink,
                    { to: { name: route.name as string } },
                    { default: () => route.meta?.title ?? route.name }
                ),
            key: route.name as string,
            icon: () => h('span', {class: route.meta?.icon}),
        }
    })
}

