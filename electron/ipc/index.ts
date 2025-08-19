import {registerFileDialogHandler} from './fileDialog'
import {registerSettingHandler} from './setting'
import {registerProjectHandlers} from "./project.ts";
import { registerCommandHandlers } from "./command.ts";
import {registerProjectBuildHandlers} from "./projectBuild.ts";

export function registerAllIpcHandlers() {
    // 注册文件选择相关 IPC
    registerFileDialogHandler()
    // 注册设置相关 IPC
    registerSettingHandler()
    // 注册项目相关 IPC
    registerProjectHandlers()
    // 注册命令相关 IPC
    registerCommandHandlers()
    // 注册项目构建相关 IPC
    registerProjectBuildHandlers()
}
