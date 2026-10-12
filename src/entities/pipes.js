import { PIPE, SCROLL, W, GROUND_Y, BIRD } from '../config.js';

function circleRect(cx, cy, r, x, y, w, h) {
  const nx = Math.max(x, Math.min(cx, x + w));
  const ny = Math.max(y, Math.min(cy, y + h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export class Pipes {
  constructor() {
    this.list = [];
  }

  reset() {
    this.list = [];
  }

  start() {
    this.spawn(PIPE.firstX);
  }

  spawn(x) {
    const top = PIPE.minTop + Math.random() * (PIPE.maxTop - PIPE.minTop);
    this.list.push({ x, top: Math.round(top), passed: false });
  }

  update() {
    for (const p of this.list) p.x -= SCROLL;
    while (this.list.length && this.list[0].x + PIPE.w < -16) this.list.shift();
    const last = this.list[this.list.length - 1];
    if (last && last.x + PIPE.spacing <= W + 16) this.spawn(last.x + PIPE.spacing);
  }

  /** 小鳥通過水管中線時回傳 true（只用來播放「叮」音效，不加分） */
  checkPassed(birdX) {
    for (const p of this.list) {
      if (!p.passed && p.x + PIPE.w / 2 < birdX) {
        p.passed = true;
        return true;
      }
    }
    return false;
  }

  collides(bird) {
    const r = BIRD.radius;
    for (const p of this.list) {
      if (bird.x + r < p.x || bird.x - r > p.x + PIPE.w) continue;
      // 上方水管視為無限高，飛出畫面頂端也會撞到
      if (circleRect(bird.x, bird.y, r, p.x, -2000, PIPE.w, p.top + 2000)) return true;
      const by = p.top + PIPE.gap;
      if (circleRect(bird.x, bird.y, r, p.x, by, PIPE.w, GROUND_Y - by)) return true;
    }
    return false;
  }
}
