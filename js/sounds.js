// Sound effects using Web Audio API — no external files needed.
let actx = null;
let enabled = localStorage.getItem('snake_sound') !== 'off';

function getCtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  // Browsers suspend AudioContext until a user gesture — resume on demand.
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

export function isSoundEnabled() { return enabled; }

export function toggleSound() {
  enabled = !enabled;
  localStorage.setItem('snake_sound', enabled ? 'on' : 'off');
  return enabled;
}

export function playEat() {
  if (!enabled) return;
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(660, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, ac.currentTime + 0.07);
    gain.gain.setValueAtTime(0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.09);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.09);
  } catch (_) {}
}

export function playGameOver() {
  if (!enabled) return;
  try {
    const ac = getCtx();
    [400, 330, 260, 180].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sawtooth';
      const t = ac.currentTime + i * 0.13;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.10, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  } catch (_) {}
}

export function initSound() {
  const btn = document.getElementById('sound-btn');
  if (!btn) return;
  btn.textContent = enabled ? 'SFX ON' : 'SFX OFF';
  btn.addEventListener('click', () => {
    const on = toggleSound();
    btn.textContent = on ? 'SFX ON' : 'SFX OFF';
  });
}
