import path from 'node:path'
import { readConfig } from '../ipc/setting'
import { initDatabase } from './initDatabase'

const config = readConfig()
const dataDir = config.defaultProjectPath
// 指定数据库文件路径
const dbPath = path.join(dataDir,'data','data.db')

// 初始化数据库
initDatabase()

// 导出数据库路径供其他模块使用
export { dbPath }
