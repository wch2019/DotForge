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
        available: number
        usage: number
    }
    swap: {
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
/**
 * 测试 SSH 连接是否可用
 */
export async function testServerConnection(config: SSHConnectionConfig): Promise<boolean> {
    return new Promise((resolve) => {
        const client = new Client()

        const connectConfig: ConnectConfig = {
            host: config.host,
            port: config.port,
            username: config.username,
            readyTimeout: 10000,   // 超时时间 10 秒
        }

        if (config.password) {
            connectConfig.password = config.password
        } else if (config.privateKeyPath) {
            try {
                connectConfig.privateKey = fs.readFileSync(config.privateKeyPath, 'utf8')
            } catch (err) {
                console.error('读取私钥失败:', err)
                resolve(false)
                return
            }
        } else {
            console.error('需要密码或私钥')
            resolve(false)
            return
        }

        client.on('ready', () => {
            console.log('SSH 连接成功')
            client.end()
            resolve(true)
        })

        client.on('error', (err) => {
            console.error('SSH 连接失败:', err)
            resolve(false)
        })

        client.connect(connectConfig)
    })
}

class SSHManager {
    /** SSH连接管理 */
    private connections: Map<string, Client> = new Map()

    /** 连接到远程服务器 */
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

    /** 执行命令 */
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
                })

                stream.on('end', () => {
                    resolve(output)
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
            const memInfoRaw = await this.executeCommand(connectionId, 'free -m')
            const memInfo = this.parseMemoryInfo(memInfoRaw);

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

            const cpuUsage = await sshManager.getCPUUsage(connectionId);

            return {
                cpu: {
                    usage: cpuUsage,
                    cores: parseInt(cpuCores.trim()),
                    model: cpuInfo.trim()
                },
                memory: memInfo.memory,
                swap: memInfo.swap,
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

    /**
     * 解析 `free -m` 输出，提取内存和 Swap 信息
     * @param output free -m 命令的输出
     */
    private parseMemoryInfo(output: string) {
        const lines = output.trim().split('\n')

        // 找到 "Mem:" 和 "Swap:" 两行
        const memLine = lines.find(line => line.startsWith('Mem:'))
        const swapLine = lines.find(line => line.startsWith('Swap:'))

        if (!memLine || !swapLine) {
            throw new Error('无法解析 free -m 输出')
        }

        // 按空格分割并过滤掉多余空字符串
        const memParts = memLine.split(/\s+/)
        const swapParts = swapLine.split(/\s+/)

        return {
            memory: {
                total: Number(memParts[1]),
                used: Number(memParts[2]),
                free: Number(memParts[3]),
                available: Number(memParts[6]),
                usage: Math.round((parseInt(memParts[2]) / parseInt(memParts[1])) * 100)
            },
            swap: {
                total: Number(swapParts[1]),
                used: Number(swapParts[2]),
                free: Number(swapParts[3]),
                usage: Math.round((parseInt(swapParts[2]) / parseInt(swapParts[1])) * 100)
            }
        }
    }

    /**
     * 获取远程主机 CPU 使用率（百分比）
     * 原理：读取 /proc/stat 两次采样，计算差值
     */
    async getCPUUsage(connectionId: string, interval = 1000): Promise<number> {
        try {
            // 读取第一次 CPU 信息
            const cpuStat1 = await this.executeCommand(connectionId, 'cat /proc/stat | grep "^cpu "');
            const values1 = cpuStat1.trim().split(/\s+/).slice(1).map(Number);
            const idle1 = values1[3];
            const total1 = values1.reduce((a, b) => a + b, 0);

            // 等待 interval 毫秒
            await new Promise(resolve => setTimeout(resolve, interval));

            // 读取第二次 CPU 信息
            const cpuStat2 = await this.executeCommand(connectionId, 'cat /proc/stat | grep "^cpu "');
            const values2 = cpuStat2.trim().split(/\s+/).slice(1).map(Number);
            const idle2 = values2[3];
            const total2 = values2.reduce((a, b) => a + b, 0);

            const idleDiff = idle2 - idle1;
            const totalDiff = total2 - total1;

            if (totalDiff === 0) return 0;

            const usage = (1 - idleDiff / totalDiff) * 100;
            return Number(usage.toFixed(2));
        } catch (error) {
            console.error('获取 CPU 使用率失败:', error);
            return 0;
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

    /** 创建shell */
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

    ipcMain.handle('ssh:createShell', async (event, connectionId: string) => {
        try {
            const {stream, cols, rows} = await sshManager.createShell(connectionId)

            // 监听远程输出 -> 发给前端
            stream.on('data', (data: Buffer) => {
                event.sender.send(`ssh:data:${connectionId}`, data.toString())
            })

            stream.stderr.on('data', (data: Buffer) => {
                event.sender.send(`ssh:data:${connectionId}`, data.toString())
            })

            // 通道定义
            const inputChannel = `ssh:input:${connectionId}`

            // 输入事件
            const inputHandler = (_: any, input: string) => {
                stream.write(input)
            }
            ipcMain.on(inputChannel, inputHandler)

            // 关闭时清理
            stream.on('close', () => {
                ipcMain.removeListener(inputChannel, inputHandler)
                event.sender.send(`ssh:close:${connectionId}`)
            })

            return {cols, rows} // 返回终端大小，前端好初始化 xterm.js
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

    ipcMain.handle('ssh:test', async (_, data) => {
        try { return await testServerConnection(data) } catch (e) { console.error('测试服务器连接失败:', e); return false }
    })
}
