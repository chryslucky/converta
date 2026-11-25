const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const createContext = () => new (window.AudioContext || window.webkitAudioContext)();

export async function decodeAudioFile(file) {
  if (!file) throw new Error('Choose an audio file first.');
  const context = createContext();
  try {
    const bytes = await file.arrayBuffer();
    return await context.decodeAudioData(bytes.slice(0));
  } catch (error) {
    throw new Error('This browser could not decode the selected audio. Try MP3, WAV, AAC, OGG or FLAC.');
  } finally {
    await context.close().catch(() => undefined);
  }
}

export function sliceAudioBuffer(buffer, start = 0, end = buffer.duration) {
  const sampleRate = buffer.sampleRate;
  const from = clamp(Math.floor(start * sampleRate), 0, buffer.length);
  const to = clamp(Math.floor(end * sampleRate), from, buffer.length);
  const length = Math.max(1, to - from);
  const context = createContext();
  const result = context.createBuffer(buffer.numberOfChannels, length, sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    result.copyToChannel(buffer.getChannelData(channel).slice(from, to), channel);
  }
  context.close().catch(() => undefined);
  return result;
}

export function joinAudioBuffers(buffers) {
  const valid = buffers.filter(Boolean);
  if (!valid.length) throw new Error('Add at least one audio clip.');
  const rate = valid[0].sampleRate;
  const channels = Math.min(2, Math.max(...valid.map((buffer) => buffer.numberOfChannels)));
  const total = valid.reduce((sum, buffer) => sum + Math.ceil(buffer.duration * rate), 0);
  const context = createContext();
  const output = context.createBuffer(channels, total, rate);
  let offset = 0;
  for (const buffer of valid) {
    const count = Math.ceil(buffer.duration * rate);
    for (let channel = 0; channel < channels; channel += 1) {
      const input = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1));
      const target = output.getChannelData(channel);
      const ratio = buffer.sampleRate / rate;
      for (let i = 0; i < count; i += 1) {
        const position = i * ratio;
        const low = Math.min(input.length - 1, Math.floor(position));
        const high = Math.min(input.length - 1, low + 1);
        const fraction = position - low;
        target[offset + i] = input[low] * (1 - fraction) + input[high] * fraction;
      }
    }
    offset += count;
  }
  context.close().catch(() => undefined);
  return output;
}

export function removeAudioRange(buffer, start, end) {
  const left = sliceAudioBuffer(buffer, 0, start);
  const right = sliceAudioBuffer(buffer, end, buffer.duration);
  return joinAudioBuffers([left, right]);
}

export function reverseAudioBuffer(buffer) {
  const context = createContext();
  const output = context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    output.copyToChannel(Float32Array.from(buffer.getChannelData(channel)).reverse(), channel);
  }
  context.close().catch(() => undefined);
  return output;
}

export function normalizeAudioBuffer(buffer, targetPeak = 0.94) {
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i]));
  }
  if (!peak) return buffer;
  const gain = targetPeak / peak;
  const context = createContext();
  const output = context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const input = buffer.getChannelData(channel);
    const target = output.getChannelData(channel);
    for (let i = 0; i < input.length; i += 1) target[i] = clamp(input[i] * gain, -1, 1);
  }
  context.close().catch(() => undefined);
  return output;
}

export function applyFade(buffer, seconds, direction = 'in') {
  const context = createContext();
  const output = context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const count = Math.min(buffer.length, Math.max(1, Math.floor(seconds * buffer.sampleRate)));
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const input = buffer.getChannelData(channel);
    const target = output.getChannelData(channel);
    target.set(input);
    for (let i = 0; i < count; i += 1) {
      const factor = direction === 'in' ? i / count : (count - i) / count;
      const index = direction === 'in' ? i : buffer.length - count + i;
      target[index] *= factor;
    }
  }
  context.close().catch(() => undefined);
  return output;
}

export function silenceGate(buffer, thresholdDb = -42) {
  const threshold = Math.pow(10, thresholdDb / 20);
  const frame = Math.max(1, Math.floor(buffer.sampleRate * 0.012));
  const keep = [];
  for (let start = 0; start < buffer.length; start += frame) {
    let peak = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = start; i < Math.min(start + frame, buffer.length); i += 1) peak = Math.max(peak, Math.abs(data[i]));
    }
    if (peak >= threshold) keep.push([Math.max(0, start - frame), Math.min(buffer.length, start + frame * 2)]);
  }
  if (!keep.length) return buffer;
  const merged = [];
  for (const range of keep) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push(range.slice());
  }
  const parts = merged.map(([from, to]) => sliceAudioBuffer(buffer, from / buffer.sampleRate, to / buffer.sampleRate));
  return joinAudioBuffers(parts);
}

function makeDistortionCurve(amount = 0) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const strength = clamp(amount, 0, 100) / 100;
  for (let i = 0; i < samples; i += 1) {
    const x = (i * 2) / samples - 1;
    curve[i] = (1 + strength * 18) * x / (1 + strength * 18 * Math.abs(x));
  }
  return curve;
}

function makeImpulse(context, duration, decay) {
  const length = Math.max(1, Math.floor(context.sampleRate * duration));
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return impulse;
}

export async function processAudioBuffer(input, settings = {}) {
  if (!input) throw new Error('Load an audio file before applying effects.');
  let buffer = input;
  const duration = buffer.duration;
  const trimStart = clamp(Number(settings.trimStart) || 0, 0, duration);
  const trimEnd = clamp(Number(settings.trimEnd) || duration, trimStart + 0.02, duration);
  if (trimStart > 0 || trimEnd < duration) buffer = sliceAudioBuffer(buffer, trimStart, trimEnd);
  if (settings.cutStart != null && settings.cutEnd != null && settings.cutEnd > settings.cutStart) {
    const a = clamp(Number(settings.cutStart), 0, buffer.duration);
    const b = clamp(Number(settings.cutEnd), a, buffer.duration);
    if (b > a + 0.02) buffer = removeAudioRange(buffer, a, b);
  }
  if (settings.removeSilence) buffer = silenceGate(buffer, Number(settings.gateDb) || -42);
  if (settings.reverse) buffer = reverseAudioBuffer(buffer);
  if (settings.fadeIn > 0) buffer = applyFade(buffer, Number(settings.fadeIn), 'in');
  if (settings.fadeOut > 0) buffer = applyFade(buffer, Number(settings.fadeOut), 'out');
  if (settings.normalize) buffer = normalizeAudioBuffer(buffer);
  if (settings.mono && buffer.numberOfChannels > 1) {
    const context = createContext();
    const mono = context.createBuffer(1, buffer.length, buffer.sampleRate);
    const target = mono.getChannelData(0);
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i += 1) target[i] += data[i] / buffer.numberOfChannels;
    }
    buffer = mono;
    context.close().catch(() => undefined);
  }

  const preset = settings.voicePreset || {};
  const pitch = Number(settings.pitch || 0) + Number(preset.pitch || 0);
  const speed = clamp(Number(settings.speed || 1) * Number(preset.speed || 1), 0.5, 2);
  const playbackRate = clamp(speed * Math.pow(2, pitch / 12), 0.5, 2);
  const durationOut = Math.max(0.1, buffer.duration / playbackRate);
  const channels = Math.max(1, Math.min(2, buffer.numberOfChannels));
  const frames = Math.ceil(durationOut * buffer.sampleRate);
  const offline = new OfflineAudioContext(channels, frames, buffer.sampleRate);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;

  let node = source;
  const connectFilter = (type, frequency, gain) => {
    const filter = offline.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = clamp(Number(frequency), 30, 18000);
    if (gain != null) filter.gain.value = clamp(Number(gain), -18, 18);
    node.connect(filter);
    node = filter;
  };
  const highpass = Number(settings.highpass || preset.highpass || 0);
  const lowpass = Number(settings.lowpass || preset.lowpass || 0);
  const bass = Number(settings.bass || preset.bass || 0);
  const treble = Number(settings.treble || preset.treble || 0);
  if (highpass > 0) connectFilter('highpass', highpass);
  if (lowpass > 0) connectFilter('lowpass', lowpass);
  if (bass !== 0) connectFilter('lowshelf', 240, bass);
  if (treble !== 0) connectFilter('highshelf', 4200, treble);

  const distortion = clamp(Number(settings.distortion || preset.distortion || 0), 0, 100);
  if (distortion > 0) {
    const shaper = offline.createWaveShaper();
    shaper.curve = makeDistortionCurve(distortion);
    shaper.oversample = '4x';
    node.connect(shaper);
    node = shaper;
  }
  const compressor = offline.createDynamicsCompressor();
  compressor.threshold.value = settings.compress === false ? 0 : -20;
  compressor.knee.value = 20;
  compressor.ratio.value = settings.compress === false ? 1 : 3;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.2;
  node.connect(compressor);
  node = compressor;

  const output = offline.createGain();
  const gainValue = clamp(Number(settings.gain ?? 100), 0, 200) / 100;
  output.gain.value = gainValue;
  node.connect(output);

  const echo = clamp(Number(settings.echo || preset.echo || 0), 0, 0.9);
  if (echo > 0) {
    const delay = offline.createDelay(1.5);
    const feedback = offline.createGain();
    const echoGain = offline.createGain();
    delay.delayTime.value = 0.24;
    feedback.gain.value = echo * 0.42;
    echoGain.gain.value = echo * 0.7;
    output.connect(delay);
    delay.connect(echoGain);
    echoGain.connect(offline.destination);
    delay.connect(feedback);
    feedback.connect(delay);
  }
  const reverb = clamp(Number(settings.reverb || preset.reverb || 0), 0, 1);
  if (reverb > 0) {
    const convolver = offline.createConvolver();
    convolver.buffer = makeImpulse(offline, 1.6 + reverb * 2.4, 2.4);
    const wet = offline.createGain();
    wet.gain.value = reverb * 0.65;
    output.connect(convolver);
    convolver.connect(wet);
    wet.connect(offline.destination);
  }
  const robot = clamp(Number(preset.robot || 0), 0, 1);
  if (robot > 0) {
    const modulator = offline.createOscillator();
    const modGain = offline.createGain();
    modulator.frequency.value = 38 + robot * 70;
    modGain.gain.value = robot * 0.55;
    modulator.connect(modGain);
    modGain.connect(output.gain);
    modulator.start(0);
    modulator.stop(durationOut);
  }
  const chorus = clamp(Number(settings.chorus || preset.chorus || 0), 0, 1);
  if (chorus > 0) {
    const delay = offline.createDelay(0.08);
    const wet = offline.createGain();
    const lfo = offline.createOscillator();
    const depth = offline.createGain();
    delay.delayTime.value = 0.025;
    wet.gain.value = chorus * 0.45;
    lfo.frequency.value = 0.3 + chorus * 1.7;
    depth.gain.value = 0.009 * chorus;
    lfo.connect(depth);
    depth.connect(delay.delayTime);
    lfo.start(0);
    lfo.stop(durationOut);
    output.connect(delay);
    delay.connect(wet);
    wet.connect(offline.destination);
  }
  output.connect(offline.destination);
  source.start(0);
  return await offline.startRendering();
}

export async function mixAudioBuffers(tracks) {
  const active = tracks.filter((track) => track && track.buffer);
  if (!active.length) throw new Error('Add an audio track before mixing.');
  const sampleRate = active[0].buffer.sampleRate;
  const channels = Math.max(1, Math.min(2, Math.max(...active.map((track) => track.buffer.numberOfChannels))));
  const duration = Math.max(...active.map((track) => Math.max(0, Number(track.offset) || 0) + track.buffer.duration));
  const offline = new OfflineAudioContext(channels, Math.ceil(duration * sampleRate), sampleRate);
  for (const track of active) {
    const source = offline.createBufferSource();
    source.buffer = track.buffer;
    const gain = offline.createGain();
    gain.gain.value = clamp(Number(track.gain ?? 100) / 100, 0, 2);
    source.connect(gain);
    if (track.pan != null && offline.createStereoPanner) {
      const panner = offline.createStereoPanner();
      panner.pan.value = clamp(Number(track.pan), -1, 1);
      gain.connect(panner);
      panner.connect(offline.destination);
    } else gain.connect(offline.destination);
    source.start(Math.max(0, Number(track.offset) || 0));
  }
  return await offline.startRendering();
}

export function audioBufferToWav(buffer) {
  const channels = Math.min(2, buffer.numberOfChannels);
  const length = buffer.length;
  const bytesPerSample = 2;
  const dataSize = length * channels * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  const writeString = (offset, value) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  let offset = 44;
  const channelData = Array.from({ length: channels }, (_, index) => buffer.getChannelData(index));
  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = clamp(channelData[channel][i], -1, 1);
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
