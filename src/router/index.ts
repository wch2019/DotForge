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
        path: '/project/create',
        name: 'ProjectCreate',
        component: () => import('@/views/project/editor.vue'),
        meta: {
            title: '新建项目',
            showInMenu: false,
        },
    },
    {
        path: '/project/edit',
        name: 'ProjectEdit',
        component: () => import('@/views/project/editor.vue'),
        meta: {
            title: '编辑项目',
            showInMenu: false,
        },
    },
    {
        path: '/build/log',
        name: 'BuildLog',
        component: () => import('@/views/build/buildLog.vue'),
        meta: {
            title: '构建日志',
            showInMenu: false,
        },
    },
    {
        path: '/build/logs',
        name: 'BuildLogsList',
        component: () => import('@/views/build/logsList.vue'),
        meta: {
            title: '构建日志列表',
            showInMenu: false,
        },
    },
    {
        path:'/setting',
        name: 'Setting',
        component: () => import('@/views/setting/index.vue'),
        meta: {
            title: '应用设置',
            icon: 'SettingsOutline',
            showInMenu: false,
        },
     },
     {
        path: '/server',
        name: 'Server',
        component: () => import('@/views/server/index.vue'),
        meta: {
            title: '服务器管理',
            icon: 'ServerOutline',
            showInMenu: true,
        },
    },
    {
        path: '/server/edit',
        name: 'ServerEdit',
        component: () => import('@/views/server/editor.vue'),
        meta: {
            title: '服务器维护',
            showInMenu: false,
        },
    },
    {
        path: '/server/ssh',
        name: 'ServerSSH',
        component: () => import('@/views/server/ssh.vue'),
        meta: {
            title: 'SSH 终端',
            showInMenu: false,
        },
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
