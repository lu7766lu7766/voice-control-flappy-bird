import { W, H } from '../config.js';

/** 滑鼠左鍵與觸控，換算成邏輯座標以便判定按鈕 */
export class PointerInput {
  constructor(canvas) {
    this.canvas = canvas;
  }

  attach(input) {
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      input.push({
        type: 'press',
        source: 'pointer',
        x: ((e.clientX - r.left) / r.width) * W,
        y: ((e.clientY - r.top) / r.height) * H,
      });
    });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}
