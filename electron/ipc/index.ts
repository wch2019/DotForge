import { registerFileDialogHandler } from './fileDialog'
import { registerSettingHandler } from './setting'

export function registerAllIpcHandlers() {
    // 注册文件选择相关 IPC
    registerFileDialogHandler()
    // 注册设置相关 IPC
    registerSettingHandler()
}
