import './style.css';
import { W, H, STEP } from './config.js';
import { Game } from './game.js';
import { buildSprites, loadImage } from './render/sprites.js';
import { Sfx } from './audio/sfx.js';
import { InputManager } from './input/InputManager.js';
import { KeyboardInput } from './input/KeyboardInput.js';
import { PointerInput } from './input/PointerInput.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hint = document.getElementById('hint');

function resize() {
  const reserve = hint && getComputedStyle(hint).display !== 'none' ? hint.offsetHeight + 40 : 0;
  const s = Math.min(window.innerWidth / W, (window.innerHeight - reserve) / H);
  const cssW = Math.floor(W * s);
  const cssH = Math.floor(H * s);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
}
window.addEventListener('resize', resize);
resize();

const base = import.meta.env.BASE_URL;
const images = {
  day: loadImage(`${base}assets/bg_day.jpg`),
  night: loadImage(`${base}assets/bg_night.jpg`),
};

const sfx = new Sfx();
const input = new InputManager().add(new KeyboardInput()).add(new PointerInput(canvas));
// 第二版：input.add(new VoiceInput({ mode: 'volume' | 'pitch', audioContext: sfx.ctx }))

const game = new Game({ sprites: buildSprites(), images, sfx });

// 切到別的分頁時自動暫停（原版切到背景也會暫停）
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'playing') game.paused = true;
});

// 固定時間步長：不論螢幕是 60 / 120 / 144Hz，物理都以 60fps 計算
let last = performance.now();
let acc = 0;
function frame(now) {
  acc += Math.min(0.25, (now - last) / 1000);
  last = now;
  let steps = 0;
  while (acc >= STEP && steps < 8) {
    game.update(input.poll());
    acc -= STEP;
    steps++;
  }
  if (steps === 8) acc = 0;

  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  game.render(ctx);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// 方便在 DevTools 除錯
window.__game = game;
