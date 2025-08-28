export interface ServerForm{
    id?: number
    name: string
    tag?: string
    host: string
    port: number
    username: string
    authType: 'password' | 'privateKey'
    password?: string
    privateKeyPath?: string
    description?: string
}

export const tags = [
    { label: '生产', value: 'prod' },
    { label: '预发', value: 'stage' },
    { label: '测试', value: 'test' },
]
