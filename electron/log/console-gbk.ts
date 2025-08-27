import { platform } from 'process';
import iconv from 'iconv-lite';

if (platform === 'win32') {
    const stdoutWrite = process.stdout.write.bind(process.stdout);
    const stderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = ((chunk: any, ...args: any[]) => {
        if (typeof chunk === 'string') {
            chunk = iconv.encode(chunk, 'gbk');
        }
        return stdoutWrite(chunk, ...args);
    }) as typeof process.stdout.write;

    process.stderr.write = ((chunk: any, ...args: any[]) => {
        if (typeof chunk === 'string') {
            chunk = iconv.encode(chunk, 'gbk');
        }
        return stderrWrite(chunk, ...args);
    }) as typeof process.stderr.write;
}
