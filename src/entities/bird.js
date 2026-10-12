import { PHYS, BIRD, GROUND_Y } from '../config.js';

export class Bird {
  constructor() {
    this.color = 'yellow';
    this.reset(BIRD.x, 236);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.vy = 0;
    this.rot = 0; // 角度（度），正值 = 低頭
    this.hold = 0;
    this.frame = 0;
    this.animTick = 0;
    this.bobT = 0;
  }

  /** 待機：上下飄 + 慢速拍翅 */
  idle() {
    this.bobT++;
    this.y = this.baseY + Math.sin((this.bobT * Math.PI * 2) / 48) * 4;
    this.rot = 0;
    this.animate(9);
  }

  flap() {
    this.vy = PHYS.flapVelocity; // 原版是直接重設速度，而不是加速度
    this.hold = BIRD.flapHold;
    this.rot = BIRD.upAngle;
  }

  /** 遊戲中 / 死亡下墜共用的物理 */
  update(dying = false) {
    this.vy = Math.min(this.vy + PHYS.gravity, PHYS.maxFall);
    this.y += this.vy;
    if (this.y < PHYS.ceiling) {
      this.y = PHYS.ceiling;
      if (this.vy < 0) this.vy = 0;
    }

    if (dying) {
      this.rot = Math.min(BIRD.maxAngle, this.rot + BIRD.diveSpeed * 2);
    } else if (this.hold > 0) {
      this.hold--;
      this.rot = BIRD.upAngle;
    } else {
      this.rot = Math.min(BIRD.maxAngle, this.rot + BIRD.diveSpeed);
    }

    // 俯衝時翅膀停住（原版細節）
    if (!dying && this.rot < 80) this.animate(5);
    else this.frame = 1;
  }

  animate(rate) {
    if (++this.animTick >= rate) {
      this.animTick = 0;
      this.frame = (this.frame + 1) % 4;
    }
  }

  /** 0 = 翅膀上, 1 = 中, 2 = 下 */
  get wing() {
    return [0, 1, 2, 1][this.frame];
  }

  get bottom() {
    return this.y + BIRD.h / 2;
  }

  landOnGround() {
    this.y = GROUND_Y - BIRD.h / 2;
    this.vy = 0;
  }
}
