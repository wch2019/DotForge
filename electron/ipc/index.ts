import { registerFileDialogHandler } from './fileDialog'
import { registerSettingHandler } from './setting'
import {registerProjectHandlers} from "./projectHandler.ts";

export function registerAllIpcHandlers() {
    // 注册文件选择相关 IPC
    registerFileDialogHandler()
    // 注册设置相关 IPC
    registerSettingHandler()
    // 注册项目相关 IPC
    registerProjectHandlers()
}
