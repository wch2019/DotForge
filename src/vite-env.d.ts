/// <reference types="vite/client" />

import {AppConfig} from "../electron/ipc/setting.ts";

export {}

declare global {
    interface Window {
        electronAPI: {
            readConfig: () => Promise<AppConfig>
            writeConfig: (config: AppConfig) => Promise<void>
            onConfigChange?: (callback: (newConfig: any) => void) => void
        }
    }
}

