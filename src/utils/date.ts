/**
 * 时间格式化
 * @param timestamp
 */
export function formatDateTime(timestamp?: number | string): string {
    if (!timestamp) return ''
    const date = new Date(Number(timestamp))
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

/**
 * 格式化构建时长
 * @param startTime 构建开始时间
 * @param endTime 构建结束时间
 */
export function formatDuration(startTime: string, endTime: string) {
    if (!startTime || !endTime) return '未知';

    const start = new Date(startTime.replace(' ', 'T'));
    const end = new Date(endTime.replace(' ', 'T'));

    let diffSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    const hours = Math.floor(diffSeconds / 3600);
    diffSeconds %= 3600;
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;

    if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
        return `${minutes}分钟${seconds}秒`;
    } else {
        return `${seconds}秒`;
    }
}
