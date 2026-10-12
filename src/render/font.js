// 5×7 像素字型，可加粗、內描邊、外描邊，模仿原版粗體像素字

const G = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '10001', '11001', '10101', '10011', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
};

const cache = new Map();

/**
 * style: { fill, fill2?, inner?, outline?, bold? }
 * fill2 = 字的下半部顏色（做出原版的雙色漸層感）
 */
export function renderText(text, style) {
  const key = `${text}|${style.fill}|${style.fill2}|${style.inner}|${style.outline}|${style.bold}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (cache.size > 600) cache.clear();

  const bold = !!style.bold;
  const gw = bold ? 6 : 5;
  const pad = (style.inner ? 1 : 0) + (style.outline ? 1 : 0);
  const chars = [...String(text).toUpperCase()];

  const xs = [];
  let tw = 0;
  chars.forEach((ch, i) => {
    xs.push(tw);
    tw += (ch === ' ' ? 3 : gw) + (i < chars.length - 1 ? 1 : 0);
  });
  const w = Math.max(1, tw + pad * 2);
  const h = 7 + pad * 2;

  const mask = new Uint8Array(w * h);
  chars.forEach((ch, i) => {
    if (ch === ' ') return;
    const rows = G[ch] || G['?'];
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 5; x++) {
        if (rows[y][x] !== '1') continue;
        mask[(y + pad) * w + xs[i] + x + pad] = 1;
        if (bold) mask[(y + pad) * w + xs[i] + x + 1 + pad] = 1;
      }
    }
  });

  const dilate = (m) => {
    const o = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!m[y * w + x]) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < w && ny < h) o[ny * w + nx] = 1;
          }
        }
      }
    }
    return o;
  };

  const inner = style.inner ? dilate(mask) : null;
  const outer = style.outline ? dilate(inner || mask) : null;

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const plot = (m, colorAt) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!m[y * w + x]) continue;
        g.fillStyle = colorAt(y);
        g.fillRect(x, y, 1, 1);
      }
    }
  };
  if (outer) plot(outer, () => style.outline);
  if (inner) plot(inner, () => style.inner);
  plot(mask, (y) => (style.fill2 && y - pad >= 4 ? style.fill2 : style.fill));

  cache.set(key, c);
  return c;
}

/** 在 (x, y) 畫字，px = 每個字型像素對應幾個邏輯像素；回傳寬度 */
export function drawText(ctx, text, x, y, px, style, align = 'center') {
  const c = renderText(text, style);
  const w = c.width * px;
  const h = c.height * px;
  const dx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.drawImage(c, Math.round(dx), Math.round(y), w, h);
  return w;
}

export function textWidth(text, px, style) {
  return renderText(text, style).width * px;
}

export const TEXT = {
  score: { fill: '#ffffff', outline: '#2b1d24', bold: true },
  small: { fill: '#ffffff', outline: '#543847', bold: true },
  logo: { fill: '#fff7b0', fill2: '#f9c933', inner: '#ffffff', outline: '#543847', bold: true },
  getReady: { fill: '#a5eb6c', fill2: '#4fb02b', inner: '#ffffff', outline: '#543847', bold: true },
  gameOver: { fill: '#ffcf5a', fill2: '#f08a1c', inner: '#ffffff', outline: '#543847', bold: true },
  label: { fill: '#e86a17' },
  tap: { fill: '#f45a28', outline: '#ffffff', bold: true },
  hint: { fill: '#ffffff', outline: '#543847' },
  badge: { fill: '#ffffff' },
};
