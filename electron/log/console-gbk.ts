import { platform } from 'process';
import iconv from 'iconv-lite';

if (platform === 'win32') {
    const stdoutWrite = process.stdout.write.bind(process.stdout);
    const stderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = (chunk: any, encoding?: BufferEncoding, callback?: () => void) => {
        if (typeof chunk === 'string') {
            chunk = iconv.encode(chunk, 'gbk');
        }
        return stdoutWrite(chunk, encoding as any, callback);
    };

    process.stderr.write = (chunk: any, encoding?: BufferEncoding, callback?: () => void) => {
        if (typeof chunk === 'string') {
            chunk = iconv.encode(chunk, 'gbk');
        }
        return stderrWrite(chunk, encoding as any, callback);
    };
}
