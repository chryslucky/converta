export const OUTPUT_FORMATS = [
  { id: 'mp3', name: 'MP3', detail: 'Universal', mime: 'audio/mpeg', extension: 'mp3', lossy: true },
  { id: 'wav', name: 'WAV', detail: 'Uncompressed', mime: 'audio/wav', extension: 'wav', lossy: false },
  { id: 'flac', name: 'FLAC', detail: 'Lossless', mime: 'audio/flac', extension: 'flac', lossy: false },
  { id: 'aac', name: 'AAC', detail: 'Efficient', mime: 'audio/aac', extension: 'aac', lossy: true },
  { id: 'ogg', name: 'OGG', detail: 'Open format', mime: 'audio/ogg', extension: 'ogg', lossy: true }
];

const lossyArgs = {
  mp3: (bitrate) => ['-c:a', 'libmp3lame', '-b:a', bitrate],
  aac: (bitrate) => ['-c:a', 'aac', '-b:a', bitrate, '-f', 'adts'],
  ogg: (bitrate) => ['-c:a', 'libvorbis', '-b:a', bitrate]
};

export function buildOutputArguments({ format, bitrate = '192k', sampleRate = 'source' }) {
  const selected = OUTPUT_FORMATS.find((item) => item.id === format);
  if (!selected) throw new Error(`Unsupported output format: ${format}`);

  let codecArguments;
  if (format in lossyArgs) codecArguments = lossyArgs[format](bitrate);
  else if (format === 'wav') codecArguments = ['-c:a', 'pcm_s16le'];
  else codecArguments = ['-c:a', 'flac', '-compression_level', '8'];

  const sampleRateArguments = sampleRate === 'source' ? [] : ['-ar', String(sampleRate)];
  return ['-y', '-i', null, '-map', '0:a:0', '-vn', '-map_metadata', '0', ...sampleRateArguments, ...codecArguments, null];
}

export function getExtension(format) {
  const selected = OUTPUT_FORMATS.find((item) => item.id === format);
  if (!selected) throw new Error(`Unsupported output format: ${format}`);
  return selected.extension;
}

const supportedExtensions = new Set([
  'mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'wma', 'aif', 'aiff',
  'mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v', 'mpeg', 'mpg', '3gp', 'ogv'
]);

export function isSupportedMedia(file) {
  if (!file || typeof file.name !== 'string') return false;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return file.type?.startsWith('audio/') || file.type?.startsWith('video/') || supportedExtensions.has(extension);
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; value >= 1024 && index < units.length; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${unit}`;
}
