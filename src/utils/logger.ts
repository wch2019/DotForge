import { ref } from "vue"

export class Logger {
    static info = ref("\x1b[32m[INFO]\x1b[0m ")
    static error = ref("\x1b[31m[ERROR]\x1b[0m ")
    static warn = ref("\x1b[33m[WARN]\x1b[0m ")

    static logInfo(message: string) {
        return this.info.value + message
    }

    static logError(message: string) {
       return this.error.value + message
    }

    static logWarn(message: string) {
        return this.warn.value + message
    }
}
