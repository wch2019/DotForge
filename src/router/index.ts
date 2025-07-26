import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
            title: '首页',
            icon: 'HomeOutline',
            showInMenu: true,
        },
    },
    {
        path: '/project',
        name: 'Project',
        component: () => import('@/views/project/index.vue'),
        meta: {
            title: '项目管理',
            icon: 'FolderOutline',
            showInMenu: true,
        },
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/setting/index.vue'),
        meta: {
            title: '设置',
            icon: 'SettingsOutline',
            showInMenu: true,
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
