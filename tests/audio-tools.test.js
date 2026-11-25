import test from 'node:test';
import assert from 'node:assert/strict';
import { audioBufferToWav } from '../src/audio-tools.js';

function fakeAudioBuffer(channelSamples, sampleRate = 48000) {
  return {
    numberOfChannels: channelSamples.length,
    length: channelSamples[0]?.length || 0,
    sampleRate,
    getChannelData(channel) {
      return channelSamples[channel];
    }
  };
}

test('WAV export stores 32-bit IEEE float samples without reducing channel count', async () => {
  const source = fakeAudioBuffer([
    Float32Array.from([0, 0.25, -0.5]),
    Float32Array.from([1, -1, 0.125]),
    Float32Array.from([0.75, -0.75, 0.0625])
  ]);
  const blob = audioBufferToWav(source);
  const bytes = await blob.arrayBuffer();
  const view = new DataView(bytes);

  assert.equal(blob.type, 'audio/wav');
  assert.equal(view.getUint32(0, false), 0x52494646);
  assert.equal(view.getUint32(8, false), 0x57415645);
  assert.equal(view.getUint16(20, true), 3, 'format code 3 denotes IEEE float');
  assert.equal(view.getUint16(22, true), 3, 'all three channels are retained');
  assert.equal(view.getUint32(24, true), 48000);
  assert.equal(view.getUint16(34, true), 32);
  assert.equal(view.getUint32(40, true), 3 * 3 * 4);
  assert.equal(view.getFloat32(44, true), 0);
  assert.equal(view.getFloat32(48, true), 1);
  assert.equal(view.getFloat32(52, true), 0.75);
  assert.equal(view.getFloat32(56, true), 0.25);
  assert.equal(view.getFloat32(60, true), -1);
  assert.equal(view.getFloat32(64, true), -0.75);
});

test('WAV export rejects empty and oversized buffers', () => {
  assert.throws(() => audioBufferToWav(null), /valid audio buffer/i);
  const oversized = {
    numberOfChannels: 2,
    length: 0x40000000,
    sampleRate: 48000,
    getChannelData() { return new Float32Array(0); }
  };
  assert.throws(() => audioBufferToWav(oversized), /too large/i);
});
