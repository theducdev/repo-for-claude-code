let audioCtx = null;

function ac() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tone(freq, duration, type = 'square', vol = 0.12) {
  try {
    const ctx = ac();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) { /* audio blocked, ignore */ }
}

export function playEat() {
  tone(330, 0.07, 'square', 0.1);
  setTimeout(() => tone(440, 0.07, 'square', 0.08), 55);
}

export function playPowerup() {
  tone(440, 0.09, 'sine', 0.14);
  setTimeout(() => tone(660, 0.09, 'sine', 0.14), 80);
  setTimeout(() => tone(880, 0.14, 'sine', 0.12), 160);
}

export function playDie() {
  try {
    const ctx = ac();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch (_) { /* audio blocked, ignore */ }
}
