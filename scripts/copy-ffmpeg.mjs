import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('node_modules/@ffmpeg/core/dist/esm');
const destination = resolve('public/ffmpeg');
await mkdir(destination, { recursive: true });
for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  await copyFile(resolve(source, file), resolve(destination, file));
}
console.log('FFmpeg WebAssembly runtime copied to public/ffmpeg.');
