import {ipcMain} from 'electron'
import {Client, ClientChannel, ConnectConfig} from 'ssh2'
import * as fs from 'fs'

export interface SSHConnectionConfig {
    host: string
    port: number
    username: string
    password?: string
    privateKeyPath?: string
}

export interface SystemInfo {
    cpu: {
        usage: number
        cores: number
        model: string
    }
    memory: {
        total: number
        used: number
        free: number
        usage: number
    }
    disk: {
        total: number
        used: number
        free: number
        usage: number
    }
    network: {
        rx: number
        tx: number
    }
    uptime: number
    loadAverage: number[]
}

class SSHManager {
    private connections: Map<string, Client> = new Map()

    async connect(config: SSHConnectionConfig): Promise<string> {
        return new Promise((resolve, reject) => {
            const client = new Client()
            const connectionId = `${config.username}@${config.host}:${config.port}`

            const connectConfig: ConnectConfig = {
                host: config.host,
                port: config.port,
                username: config.username,
                readyTimeout: 20000,
                keepaliveInterval: 10000,
            }

            if (config.password) {
                connectConfig.password = config.password
            } else if (config.privateKeyPath) {
                try {
                    connectConfig.privateKey = fs.readFileSync(config.privateKeyPath, 'utf8')
                } catch (error) {
                    reject(new Error(`无法读取私钥文件: ${error}`))
                    return
                }
            } else {
                reject(new Error('需要提供密码或私钥'))
                return
            }

            client.on('ready', () => {
                this.connections.set(connectionId, client)
                resolve(connectionId)
            })

            client.on('error', (err) => {
                reject(new Error(`SSH连接失败: ${err.message}`))
            })

            client.connect(connectConfig)
        })
    }

    async executeCommand(connectionId: string, command: string): Promise<string> {
        const client = this.connections.get(connectionId)
        if (!client) {
            throw new Error('连接不存在')
        }

        return new Promise((resolve, reject) => {
            client.exec(command, (err, stream) => {
                if (err) {
                    reject(new Error(`命令执行失败: ${err.message}`))
                    return
                }

                let output = ''
                stream.on('data', (data: Buffer) => {
                    output += data.toString()
                    console.log(output)
                })

                stream.on('end', () => {
                    resolve(output)
                    console.log(output)
                })

                stream.on('error', (err: Error) => {
                    reject(new Error(`流错误: ${err.message}`))
                })
            })
        })
    }

    /** 获取系统信息 */
    async getSystemInfo(connectionId: string): Promise<SystemInfo> {
        const client = this.connections.get(connectionId)
        if (!client) {
            throw new Error('连接不存在')
        }

        try {
            // 获取CPU信息
            const cpuInfo = await this.executeCommand(connectionId, 'cat /proc/cpuinfo | grep "model name" | head -1 | cut -d: -f2 | xargs')
            const cpuCores = await this.executeCommand(connectionId, 'nproc')

            // 获取内存信息
            const memInfo = await this.executeCommand(connectionId, 'free -m')
            const memLines = memInfo.trim().split('\n')
            const memData = memLines[1].split(/\s+/)

            // 获取磁盘信息
            const diskInfo = await this.executeCommand(connectionId, 'df -h / | tail -1')
            const diskData = diskInfo.trim().split(/\s+/)

            // 获取网络信息
            const netInfo = await this.executeCommand(connectionId, 'cat /proc/net/dev | grep -E "(eth0|ens|enp)" | head -1')
            const netData = netInfo.trim().split(/\s+/)

            // 获取系统运行时间
            const uptime = await this.executeCommand(connectionId, 'cat /proc/uptime | cut -d" " -f1')

            // 获取负载平均值
            const loadAvg = await this.executeCommand(connectionId, 'cat /proc/loadavg | cut -d" " -f1,2,3')
            const loadValues = loadAvg.trim().split(/\s+/).map(Number)

            // 获取CPU使用率（需要两次采样）
            const cpuUsage1 = await this.executeCommand(connectionId, 'cat /proc/stat | grep "cpu " | cut -d" " -f2,3,4,5,6,7,8,9')
            await new Promise(resolve => setTimeout(resolve, 1000))
            const cpuUsage2 = await this.executeCommand(connectionId, 'cat /proc/stat | grep "cpu " | cut -d" " -f2,3,4,5,6,7,8,9')

            const cpuUsage = this.calculateCPUUsage(cpuUsage1, cpuUsage2)

            return {
                cpu: {
                    usage: cpuUsage,
                    cores: parseInt(cpuCores.trim()),
                    model: cpuInfo.trim()
                },
                memory: {
                    total: parseInt(memData[1]),
                    used: parseInt(memData[2]),
                    free: parseInt(memData[3]),
                    usage: Math.round((parseInt(memData[2]) / parseInt(memData[1])) * 100)
                },
                disk: {
                    total: this.parseDiskSize(diskData[1]),
                    used: this.parseDiskSize(diskData[2]),
                    free: this.parseDiskSize(diskData[3]),
                    usage: parseInt(diskData[4].replace('%', ''))
                },
                network: {
                    rx: parseInt(netData[1]) || 0,
                    tx: parseInt(netData[9]) || 0
                },
                uptime: parseFloat(uptime.trim()),
                loadAverage: loadValues
            }
        } catch (error) {
            throw new Error(`获取系统信息失败: ${error}`)
        }
    }

    /** 计算CPU使用率 */
    private calculateCPUUsage(usage1: string, usage2: string): number {
        try {
            const values1 = usage1.trim().split(/\s+/).map(Number)
            const values2 = usage2.trim().split(/\s+/).map(Number)

            if (values1.length !== 8 || values2.length !== 8) return 0

            const total1 = values1.reduce((a, b) => a + b, 0)
            const total2 = values2.reduce((a, b) => a + b, 0)
            const idle1 = values1[3]
            const idle2 = values2[3]

            const totalDiff = total2 - total1
            const idleDiff = idle2 - idle1

            if (totalDiff === 0) return 0

            return Math.round(((totalDiff - idleDiff) / totalDiff) * 100)
        } catch {
            return 0
        }
    }

    /** 解析磁盘大小 */
    private parseDiskSize(sizeStr: string): number {
        const size = sizeStr.toLowerCase()
        if (size.includes('g')) {
            return parseFloat(size.replace('g', '')) * 1024
        } else if (size.includes('m')) {
            return parseFloat(size.replace('m', ''))
        } else if (size.includes('k')) {
            return parseFloat(size.replace('k', '')) / 1024
        }
        return parseFloat(size)
    }

    async createShell(connectionId: string): Promise<{ stream: ClientChannel; cols: number; rows: number }> {
        const client = this.connections.get(connectionId)
        if (!client) {
            throw new Error('连接不存在')
        }

        return new Promise((resolve, reject) => {
            client.shell({cols: 80, rows: 24}, (err, stream) => {
                if (err) {
                    reject(new Error(`创建shell失败: ${err.message}`))
                    return
                }
                resolve({stream, cols: 80, rows: 24})
            })
        })
    }

    /** 断开连接 */
    async disconnect(connectionId: string): Promise<void> {
        const client = this.connections.get(connectionId)
        if (client) {
            client.end()
            this.connections.delete(connectionId)
        }
    }

    /** 判断连接是否已断开 */
    isConnected(connectionId: string): boolean {
        return this.connections.has(connectionId)
    }

    /** 获取连接数 */
    getConnectionCount(): number {
        return this.connections.size
    }
}

const sshManager = new SSHManager()

export function registerSSHHandlers() {
    ipcMain.handle('ssh:connect', async (_, config: SSHConnectionConfig) => {
        try {
            return await sshManager.connect(config)
        } catch (error) {
            console.error('SSH连接失败:', error)
            throw error
        }
    })

    ipcMain.handle('ssh:execute', async (_, connectionId: string, command: string) => {
        try {
            return await sshManager.executeCommand(connectionId, command)
        } catch (error) {
            console.error('SSH命令执行失败:', error)
            throw error
        }
    })

    ipcMain.handle('ssh:getSystemInfo', async (_, connectionId: string) => {
        try {
            return await sshManager.getSystemInfo(connectionId)
        } catch (error) {
            console.error('获取系统信息失败:', error)
            throw error
        }
    })

    ipcMain.handle('ssh:createShell', async (_, connectionId: string) => {
        try {
            return await sshManager.createShell(connectionId)
        } catch (error) {
            console.error('创建shell失败:', error)
            throw error
        }
    })

    ipcMain.handle('ssh:disconnect', async (_, connectionId: string) => {
        try {
            await sshManager.disconnect(connectionId)
            return true
        } catch (error) {
            console.error('断开SSH连接失败:', error)
            throw error
        }
    })

    ipcMain.handle('ssh:isConnected', async (_, connectionId: string) => {
        return sshManager.isConnected(connectionId)
    })

    ipcMain.handle('ssh:getConnectionCount', async () => {
        return sshManager.getConnectionCount()
    })

}
