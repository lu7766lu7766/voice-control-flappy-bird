import { W, H, GROUND_Y, PIPE } from '../config.js';
import { drawText, textWidth, TEXT } from './font.js';

const OUTLINE = '#543847';

// ---------- 世界物件 ----------

export function drawBackground(ctx, img, night) {
  ctx.fillStyle = night ? '#0a7a84' : '#5bc8ce';
  ctx.fillRect(-8, -8, W + 16, H + 16);
  if (img && img.complete && img.naturalWidth) {
    const dw = W + 16;
    const dh = (dw * img.naturalHeight) / img.naturalWidth;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, -8, GROUND_Y + 6 - dh, dw, dh);
    ctx.imageSmoothingEnabled = false;
  }
}

export function drawPipes(ctx, s, list) {
  for (const p of list) {
    const x = Math.round(p.x);
    const topCapY = p.top - PIPE.capH;
    ctx.drawImage(s.pipeBody, x + 2, -8, PIPE.w - 4, topCapY + 8);
    ctx.drawImage(s.pipeCap, x, topCapY, PIPE.w, PIPE.capH);
    const by = p.top + PIPE.gap;
    ctx.drawImage(s.pipeCap, x, by, PIPE.w, PIPE.capH);
    ctx.drawImage(s.pipeBody, x + 2, by + PIPE.capH, PIPE.w - 4, GROUND_Y - by - PIPE.capH + 4);
  }
}

export function drawGround(ctx, s, offset) {
  ctx.drawImage(s.ground, -24 - Math.round(offset), GROUND_Y, s.ground.width * 2, 112);
  ctx.fillStyle = '#ded895';
  ctx.fillRect(-8, H, W + 16, 8);
}

export function drawBird(ctx, s, bird) {
  ctx.save();
  ctx.translate(Math.round(bird.x), Math.round(bird.y));
  ctx.rotate((bird.rot * Math.PI) / 180);
  ctx.drawImage(s.birds[bird.color][bird.wing], -17, -12, 34, 24);
  ctx.restore();
}

// ---------- 基本元件 ----------

/** 切角矩形（像素風圓角） */
function chunkyRect(ctx, x, y, w, h, color, c = 2) {
  ctx.fillStyle = color;
  ctx.fillRect(x + c, y, w - 2 * c, h);
  ctx.fillRect(x, y + c, w, h - 2 * c);
}

function pixelCircle(ctx, cx, cy, r, color, g = 2) {
  ctx.fillStyle = color;
  for (let dy = -r; dy < r; dy += g) {
    const yy = dy + g / 2;
    const half = Math.round(Math.sqrt(Math.max(0, r * r - yy * yy)) / g) * g;
    if (half > 0) ctx.fillRect(cx - half, cy + dy, half * 2, g);
  }
}

/** 往右的像素三角形（播放鍵） */
function stepTriangle(ctx, x, y, h, color, slope = 1.6) {
  ctx.fillStyle = color;
  for (let r = 0; r < h; r += 2) {
    const d = Math.min(r, h - 2 - r);
    const len = 2 + Math.floor((d * slope) / 2) * 2;
    ctx.fillRect(x, y + r, len, 2);
  }
}

// ---------- UI ----------

export function drawScore(ctx, score) {
  drawText(ctx, String(score), W / 2, 30, 3, TEXT.score);
}

export function drawPlayButton(ctx, rect) {
  const { x, y, w, h } = rect;
  chunkyRect(ctx, x, y, w, h, OUTLINE, 4);
  chunkyRect(ctx, x + 2, y + 2, w - 4, h - 4, '#ffffff', 2);
  ctx.fillStyle = '#ddd6bc';
  ctx.fillRect(x + 4, y + h - 8, w - 8, 4);
  const th = 26;
  const tx = x + w / 2 - 9;
  const ty = y + (h - 4) / 2 - th / 2;
  stepTriangle(ctx, tx - 2, ty - 4, th + 8, OUTLINE, 1.6);
  stepTriangle(ctx, tx, ty, th, '#5ec43a', 1.6);
  ctx.fillStyle = '#9ce659';
  ctx.fillRect(tx, ty + 2, 2, th - 6);
}

export function drawPauseButton(ctx, rect, paused) {
  const { x, y, w, h } = rect;
  chunkyRect(ctx, x, y, w, h, OUTLINE, 2);
  chunkyRect(ctx, x + 2, y + 2, w - 4, h - 4, '#f8f0d8', 2);
  ctx.fillStyle = '#ded895';
  ctx.fillRect(x + 2, y + h - 6, w - 4, 4);
  if (paused) {
    stepTriangle(ctx, x + 9, y + 7, 14, OUTLINE, 1.4);
  } else {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 8, y + 7, 4, 13);
    ctx.fillRect(x + 15, y + 7, 4, 13);
  }
}

export function drawTapHint(ctx, s, cx, cy) {
  ctx.drawImage(s.arrow, Math.round(cx - 7), Math.round(cy - 34), 14, 12);
  ctx.drawImage(s.hand, Math.round(cx - 10), Math.round(cy - 16), 24, 24);
  drawText(ctx, 'TAP', cx - 44, cy + 10, 2, TEXT.tap);
  drawText(ctx, 'TAP', cx + 46, cy + 10, 2, TEXT.tap);
}

export function drawPanel(ctx, x, y, w, h) {
  chunkyRect(ctx, x, y, w, h, OUTLINE, 4);
  chunkyRect(ctx, x + 2, y + 2, w - 4, h - 4, '#ded895', 2);
  ctx.fillStyle = '#fbf6d6';
  ctx.fillRect(x + 6, y + 4, w - 12, 2);
  ctx.fillStyle = '#cbb968';
  ctx.fillRect(x + 6, y + h - 6, w - 12, 2);
}

const MEDAL_COLORS = {
  bronze: { ring: '#9a5a2c', face: '#d7894a', shine: '#f4c590' },
  silver: { ring: '#878787', face: '#cfcfcf', shine: '#ffffff' },
  gold: { ring: '#b07d10', face: '#f2c94c', shine: '#fff3b8' },
  platinum: { ring: '#8fb0b8', face: '#e3f3f6', shine: '#ffffff' },
};

export function drawMedalSlot(ctx, cx, cy) {
  pixelCircle(ctx, cx, cy, 22, '#cbb968');
  pixelCircle(ctx, cx, cy, 20, '#d4c47c');
}

export function drawMedal(ctx, cx, cy, name) {
  const c = MEDAL_COLORS[name];
  pixelCircle(ctx, cx, cy, 22, OUTLINE);
  pixelCircle(ctx, cx, cy, 20, c.ring);
  pixelCircle(ctx, cx, cy, 16, c.face);
  // 中間的星形浮雕
  ctx.fillStyle = c.ring;
  ctx.fillRect(cx - 2, cy - 8, 4, 16);
  ctx.fillRect(cx - 8, cy - 2, 16, 4);
  ctx.fillRect(cx - 4, cy - 4, 8, 8);
  // 反光
  ctx.fillStyle = c.shine;
  ctx.fillRect(cx - 12, cy - 8, 4, 6);
  ctx.fillRect(cx - 8, cy - 12, 6, 4);
}

export function drawSparkle(ctx, x, y, size) {
  const s = Math.round(size);
  if (s <= 0) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 1, y - 1 - s * 2, 2, s * 4 + 2);
  ctx.fillRect(x - 1 - s * 2, y - 1, s * 4 + 2, 2);
}

export function drawNewBadge(ctx, x, y) {
  chunkyRect(ctx, x, y, 32, 14, '#e8392b', 2);
  drawText(ctx, 'NEW', x + 16, y + 3, 1, TEXT.badge);
}

export function drawScoreboard(ctx, b) {
  const { x, y, w, h } = b;
  drawPanel(ctx, x, y, w, h);
  drawText(ctx, 'MEDAL', x + 52, y + 14, 2, TEXT.label);
  const mcx = x + 52;
  const mcy = y + 66;
  drawMedalSlot(ctx, mcx, mcy);
  if (b.medal) drawMedal(ctx, mcx, mcy, b.medal);
  for (const sp of b.sparkles || []) drawSparkle(ctx, sp.x, sp.y, sp.size);

  const rx = x + w - 16;
  drawText(ctx, 'SCORE', rx, y + 14, 2, TEXT.label, 'right');
  drawText(ctx, String(b.score), rx, y + 32, 2, TEXT.small, 'right');
  drawText(ctx, 'BEST', rx, y + 62, 2, TEXT.label, 'right');
  drawText(ctx, String(b.best), rx, y + 80, 2, TEXT.small, 'right');
  if (b.isNew) {
    const lw = textWidth('BEST', 2, TEXT.label);
    drawNewBadge(ctx, rx - lw - 38, y + 62);
  }
}

export function drawOverlay(ctx, color, alpha) {
  if (alpha <= 0) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}
