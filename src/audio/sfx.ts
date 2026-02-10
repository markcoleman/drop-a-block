let audioCtx: AudioContext | null = null;
let muted = false;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

export const setSfxMuted = (value: boolean) => {
  muted = value;
  if (!muted && audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => undefined);
  }
};

const playTone = (frequency: number, duration = 0.08) => {
  if (muted) return;
  const ctx = getContext();
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => undefined);
  }
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gain.gain.value = 0.05;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

export const playMove = () => playTone(320, 0.03);
export const playRotate = () => playTone(440, 0.04);
export const playLock = () => playTone(220, 0.08);
export const playClear = () => playTone(600, 0.12);
