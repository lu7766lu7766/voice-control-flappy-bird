import { SCROLL } from '../config.js';

export const GROUND_PERIOD = 24; // 地板條紋的重複寬度（邏輯 px）

export class Ground {
  constructor() {
    this.offset = 0;
  }

  update() {
    this.offset = (this.offset + SCROLL) % GROUND_PERIOD;
  }
}
