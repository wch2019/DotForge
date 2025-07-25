import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
            title: '首页',
            icon: 'home',
        },
    },
    {
        path: '/project',
        name: 'Project',
        component: () => import('@/views/project/index.vue'),
        meta: {
            title: '项目',
            icon: 'info',
        },
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/setting/index.vue'),
        meta: {
            title: '设置',
            icon: 'settings',
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
