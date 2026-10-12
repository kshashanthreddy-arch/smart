// Pure Web Audio API Ambient Sound Generator
// Generates gentle rain, white noise, and focus hum locally without downloading MP3s!

let audioCtx: AudioContext | null = null;
let activeSource: AudioNode | null = null;
let gainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export type AmbientSoundType = 'rain' | 'whitenoise' | 'binaural' | 'waves' | 'none';

export function stopAmbientSound() {
  if (activeSource) {
    try {
      activeSource.disconnect();
    } catch {}
    activeSource = null;
  }
}

export function playAmbientSound(type: AmbientSoundType, volume = 0.3) {
  stopAmbientSound();
  if (type === 'none') return;

  const ctx = getAudioContext();
  gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.connect(ctx.destination);

  if (type === 'whitenoise') {
    // Generate pink/white noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.connect(gainNode);
    whiteNoise.start();
    activeSource = whiteNoise;
  } else if (type === 'rain') {
    // Generate filtered rain sound (Brownian noise with low-pass filter)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 1.8;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(gainNode);
    rainSource.start();
    activeSource = rainSource;
  } else if (type === 'binaural') {
    // 432Hz deep focus alpha wave tone with subtle binaural beat
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(216, ctx.currentTime); // Root
    osc2.frequency.setValueAtTime(226, ctx.currentTime); // 10Hz Alpha beat

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, ctx.currentTime);

    osc1.connect(oscGain);
    osc2.connect(oscGain);
    oscGain.connect(gainNode);

    osc1.start();
    osc2.start();
    activeSource = oscGain;
  } else if (type === 'waves') {
    // Ocean surf simulator with low-frequency oscillator
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    noiseSource.start();
    activeSource = noiseSource;
  }
}

export function playTimerChime() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {}
}
