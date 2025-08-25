import {defineConfig} from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src') // 设置 @ 别名，方便导入 src 目录
        }
    },
    plugins: [
        vue(),
        tailwindcss(),
        electron({
            // Electron 主进程配置
            main: {
                entry: 'electron/main.ts', // 主进程入口文件
                vite: {
                    build: {
                        rollupOptions: {
                            // 这里非常重要！
                            // 把 better-sqlite3 从打包中排除，保留为原生 CJS 模块
                            // 这样不会丢失 __filename/__dirname，也避免 ESM 引入出错
                            external: [
                                'better-sqlite3',
                                'ssh2',
                                'fs',
                                'path',
                                'crypto',
                                'net',
                                'tls',
                                'events'
                            ]
                        }
                    }
                }
            },
            // Electron 预加载脚本配置
            preload: {
                input: path.join(__dirname, 'electron/preload.ts'), // 预加载脚本路径
            },
            // 渲染进程配置
            // 如果渲染进程需要用 Node.js API，这里可以配置 nodeIntegration
            renderer: process.env.NODE_ENV === 'test'
                // 测试模式下不配置 renderer
                ? undefined
                // 生产/开发模式下使用默认配置
                : {},
        }),
    ],
})
