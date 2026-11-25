import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOutputArguments, formatBytes, getExtension, isSupportedMedia } from '../src/conversion.js';

test('builds a complete MP3 conversion argument list with selected audio settings', () => {
  const args = buildOutputArguments({ format: 'mp3', bitrate: '320k', sampleRate: '48000' });
  assert.deepEqual(args, ['-y', '-i', null, '-map', '0:a:0', '-vn', '-map_metadata', '0', '-ar', '48000', '-c:a', 'libmp3lame', '-b:a', '320k', null]);
});

test('uses floating-point WAV and lossless FLAC without a lossy bitrate', () => {
  assert.ok(buildOutputArguments({ format: 'wav' }).includes('pcm_f32le'));
  assert.ok(buildOutputArguments({ format: 'flac' }).includes('flac'));
  assert.ok(!buildOutputArguments({ format: 'wav' }).includes('-b:a'));
  assert.ok(!buildOutputArguments({ format: 'flac' }).includes('-b:a'));
});

test('supports the requested export formats', () => {
  for (const format of ['mp3', 'wav', 'flac', 'aac', 'ogg']) assert.equal(getExtension(format), format);
  assert.throws(() => getExtension('wma'), /Unsupported output format/);
});

test('recognizes supported audio and video inputs', () => {
  assert.equal(isSupportedMedia({ name: 'voice.ogg', type: '' }), true);
  assert.equal(isSupportedMedia({ name: 'clip.mov', type: '' }), true);
  assert.equal(isSupportedMedia({ name: 'track.mp3', type: 'audio/mpeg' }), true);
  assert.equal(isSupportedMedia({ name: 'notes.txt', type: 'text/plain' }), false);
});

test('formats local file sizes', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(1048576), '1.0 MB');
});
