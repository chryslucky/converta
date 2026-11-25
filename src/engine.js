import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { buildOutputArguments, getExtension, OUTPUT_FORMATS } from './conversion.js';

let engine;
let loadingPromise;

export async function getEngine(onLoadingProgress = () => {}) {
  if (engine) return engine;
  if (!loadingPromise) {
    loadingPromise = (async () => {
      const instance = new FFmpeg();
      instance.on('progress', ({ progress }) => {
        if (Number.isFinite(progress)) onLoadingProgress(Math.max(0, Math.min(99, Math.round(progress * 100))));
      });
      const base = import.meta.env.BASE_URL;
      const coreURL = await toBlobURL(`${base}ffmpeg/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${base}ffmpeg/ffmpeg-core.wasm`, 'application/wasm');
      await instance.load({ coreURL, wasmURL });
      engine = instance;
      return instance;
    })();
  }
  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = undefined;
    throw new Error(`The conversion engine could not be initialized. ${error?.message ?? ''}`.trim());
  }
}

export async function convertMedia(file, settings, onProgress = () => {}) {
  if (!(file instanceof Blob)) throw new Error('The selected file is no longer available. Please add it again.');
  if (file.size > 300 * 1024 * 1024) throw new Error('This file is larger than the 300 MB browser processing limit.');

  const selected = OUTPUT_FORMATS.find((format) => format.id === settings.format);
  if (!selected) throw new Error('Choose a supported output format.');
  const instance = await getEngine();
  const token = crypto.randomUUID();
  const safeExtension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'media';
  const inputName = `source-${token}.${safeExtension}`;
  const outputName = `converted-${token}.${getExtension(settings.format)}`;
  const handleProgress = ({ progress }) => {
    if (Number.isFinite(progress)) onProgress(Math.max(0, Math.min(99, Math.round(progress * 100))));
  };

  instance.on('progress', handleProgress);
  try {
    await instance.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    const args = buildOutputArguments(settings);
    args[2] = inputName;
    args[args.length - 1] = outputName;
    const exitCode = await instance.exec(args);
    if (exitCode !== 0) throw new Error('FFmpeg could not decode this file or find an audio stream. Try another file or format.');
    const data = await instance.readFile(outputName);
    onProgress(100);
    return new Blob([data], { type: selected.mime });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Conversion cancelled.');
    throw error instanceof Error ? error : new Error('The media could not be converted.');
  } finally {
    instance.off('progress', handleProgress);
    await Promise.all([
      instance.deleteFile(inputName).catch(() => undefined),
      instance.deleteFile(outputName).catch(() => undefined)
    ]);
  }
}

export function terminateEngine() {
  if (engine) engine.terminate();
  engine = undefined;
  loadingPromise = undefined;
}
