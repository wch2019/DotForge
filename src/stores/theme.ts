import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useOsTheme, darkTheme } from 'naive-ui'

export const useThemeStore = defineStore('theme', () => {
    const osTheme = useOsTheme()

    // 用户配置：'light' | 'dark' | 'auto'
    const userTheme = ref<'light' | 'dark' | 'auto'>('auto')

    // 当前是否暗色模式（计算得出）
    const isDark = computed(() => {
        if (userTheme.value === 'auto') return osTheme.value === 'dark'
        return userTheme.value === 'dark'
    })

    // naive-ui 的主题
    const naiveTheme = computed(() => (isDark.value ? darkTheme : null))

    // 设置主题并同步保存（写配置）
    async function setTheme(value: 'light' | 'dark' | 'auto') {
        userTheme.value = value
        const config = await window.electronAPI.readConfig()
        config.theme = value
        await window.electronAPI.writeConfig(config)
    }

    // 启动时从配置文件初始化
    async function initThemeFromConfig() {
        const config = await window.electronAPI.readConfig()
        userTheme.value = config.theme || 'auto'
    }

    // 更新 DOM 类（适配 Tailwind / 自定义样式）
    watch(isDark, (val) => {
        document.documentElement.classList.toggle('dark', val)
    }, { immediate: true })

    return {
        userTheme,
        isDark,
        naiveTheme,
        setTheme,
        initThemeFromConfig,
    }
})
