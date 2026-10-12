import { W, H, GROUND_Y, BIRD, SCORE, FPS, MEDALS, TIMING } from './config.js';
import { Bird } from './entities/bird.js';
import { Pipes } from './entities/pipes.js';
import { Ground } from './entities/ground.js';
import * as ui from './render/ui.js';
import { drawText, TEXT } from './render/font.js';
import { loadBest, saveBest } from './storage.js';

const COLORS = ['yellow', 'red', 'blue'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const inside = (r, p) => p.x != null && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

const PAUSE_BTN = { x: 10, y: 10, w: 26, h: 28 };
const PLAY_BTN_TITLE = { x: (W - 104) / 2, y: 290, w: 104, h: 58 };
const PLAY_BTN_OVER = { x: (W - 104) / 2, y: 300, w: 104, h: 58 };
const BOARD = { x: (W - 226) / 2, y: 170, w: 226, h: 114 };
const MEDAL_CENTER = { x: BOARD.x + 52, y: BOARD.y + 66 };

function medalFor(score) {
  const m = MEDALS.find((m) => score >= m.min);
  return m ? m.name : null;
}

/**
 * 狀態機：title → ready → playing → (dying) → gameover → ready ...
 */
export class Game {
  constructor({ sprites, images, sfx }) {
    this.sprites = sprites;
    this.images = images;
    this.sfx = sfx;
    this.best = loadBest();
    this.bird = new Bird();
    this.pipes = new Pipes();
    this.ground = new Ground();
    this.fade = { a: 0, phase: null, cb: null };
    this.flash = 0;
    this.shake = 0;
    this.toast = null;
    this.paused = false;
    this.dieDelay = 0;
    this.tick = 0;
    this.toTitle();
  }

  // ---------- 狀態切換 ----------

  randomize() {
    this.night = Math.random() < 0.5;
    this.bird.color = pick(COLORS);
  }

  toTitle() {
    this.state = 'title';
    this.randomize();
    this.bird.reset(W / 2, 214);
  }

  toReady() {
    this.state = 'ready';
    this.randomize();
    this.bird.reset(BIRD.x, 236);
    this.pipes.reset();
    this.frames = 0;
    this.score = 0;
    this.paused = false;
    this.flash = 0;
    this.shake = 0;
    this.dieDelay = 0;
  }

  startPlaying() {
    this.state = 'playing';
    this.pipes.start();
    this.flapBird();
  }

  flapBird() {
    this.bird.flap();
    this.sfx.wing();
  }

  die(byPipe) {
    this.sfx.hit();
    this.flash = 1;
    this.shake = 16;
    this.bird.hold = 0;
    if (byPipe) {
      this.state = 'dying';
      this.dieDelay = TIMING.dieSoundDelay;
    } else {
      this.enterGameOver();
    }
  }

  enterGameOver() {
    this.state = 'gameover';
    this.goT = 0;
    this.prevBest = this.best;
    this.isNew = this.score > this.best;
    if (this.isNew) {
      this.best = this.score;
      saveBest(this.best);
    }
    this.medal = medalFor(this.score);
    this.sparkles = [];
  }

  fadeTo(cb) {
    if (this.fade.phase) return;
    this.sfx.swoosh();
    this.fade = { a: 0, phase: 'out', cb };
  }

  // ---------- 更新 ----------

  update(input) {
    this.tick++;
    for (const e of input.events) this.handle(e);
    // input.targetY 保留給第二版「音調控制高度」使用

    this.updateFade();
    if (this.toast && --this.toast.t <= 0) this.toast = null;
    if (this.flash > 0) this.flash = Math.max(0, this.flash - 0.12);
    if (this.shake > 0) this.shake--;
    if (this.dieDelay > 0 && --this.dieDelay === 0) this.sfx.die();
    if (this.paused) return;

    switch (this.state) {
      case 'title':
      case 'ready':
        this.bird.idle();
        this.ground.update();
        break;
      case 'playing':
        this.updatePlaying();
        break;
      case 'dying':
        this.bird.update(true);
        if (this.bird.bottom >= GROUND_Y) {
          this.bird.landOnGround();
          this.enterGameOver();
        }
        break;
      case 'gameover':
        this.updateGameOver();
        break;
    }
  }

  handle(e) {
    if (e.type === 'mute') {
      this.sfx.muted = !this.sfx.muted;
      this.toast = { text: this.sfx.muted ? 'SOUND OFF' : 'SOUND ON', t: 60 };
      return;
    }
    if (e.type === 'pause') {
      if (this.state === 'playing') this.paused = !this.paused;
      return;
    }
    if (e.type !== 'press') return;

    this.sfx.unlock();
    if (this.fade.phase) return;

    switch (this.state) {
      case 'title':
        this.fadeTo(() => this.toReady());
        break;
      case 'ready':
        this.startPlaying();
        break;
      case 'playing':
        if (inside(PAUSE_BTN, e)) {
          this.paused = !this.paused;
        } else if (this.paused) {
          this.paused = false;
        } else {
          this.flapBird();
        }
        break;
      case 'gameover':
        if (this.goT >= TIMING.canRestart) this.fadeTo(() => this.toReady());
        break;
    }
  }

  updatePlaying() {
    this.frames++;
    this.score = Math.floor((this.frames * SCORE.perSecond) / FPS);
    this.bird.update();
    this.pipes.update();
    this.ground.update();
    if (this.pipes.checkPassed(this.bird.x)) this.sfx.point();

    if (this.bird.bottom >= GROUND_Y) {
      this.bird.landOnGround();
      this.die(false);
    } else if (this.pipes.collides(this.bird)) {
      this.die(true);
    }
  }

  updateGameOver() {
    this.goT++;
    if (this.goT === TIMING.title || this.goT === TIMING.panel) this.sfx.swoosh();

    if (this.medal && this.goT >= TIMING.medal) {
      if (this.goT % 7 === 0) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 18;
        this.sparkles.push({
          x: Math.round(MEDAL_CENTER.x + Math.cos(a) * r),
          y: Math.round(MEDAL_CENTER.y + Math.sin(a) * r),
          life: 0,
          max: 22,
          size: 0,
        });
      }
      for (const s of this.sparkles) {
        s.life++;
        s.size = Math.sin((s.life / s.max) * Math.PI) * 2.4;
      }
      this.sparkles = this.sparkles.filter((s) => s.life < s.max);
    }
  }

  updateFade() {
    const f = this.fade;
    if (!f.phase) return;
    const step = 1 / TIMING.fadeFrames;
    if (f.phase === 'out') {
      f.a += step;
      if (f.a >= 1) {
        f.a = 1;
        f.phase = 'in';
        f.cb?.();
      }
    } else {
      f.a -= step;
      if (f.a <= 0) {
        f.a = 0;
        f.phase = null;
      }
    }
  }

  // ---------- 繪製 ----------

  render(ctx) {
    const s = this.sprites;
    ctx.imageSmoothingEnabled = false;

    // 世界（受晃動影響）
    ctx.save();
    if (this.shake > 0) {
      const m = (4 * this.shake) / 16;
      ctx.translate(Math.round((Math.random() * 2 - 1) * m), Math.round((Math.random() * 2 - 1) * m));
    }
    ui.drawBackground(ctx, this.night ? this.images.night : this.images.day, this.night);
    ui.drawPipes(ctx, s, this.pipes.list);
    ui.drawGround(ctx, s, this.ground.offset);
    ui.drawBird(ctx, s, this.bird);
    ctx.restore();

    // UI
    switch (this.state) {
      case 'title':
        this.renderTitle(ctx);
        break;
      case 'ready':
        ui.drawScore(ctx, 0);
        drawText(ctx, 'GET READY', W / 2, 110, 3, TEXT.getReady);
        ui.drawTapHint(ctx, s, W / 2 + 10, 262);
        break;
      case 'playing':
        ui.drawScore(ctx, this.score);
        ui.drawPauseButton(ctx, PAUSE_BTN, this.paused);
        if (this.paused) this.renderPaused(ctx);
        break;
      case 'dying':
        ui.drawScore(ctx, this.score);
        break;
      case 'gameover':
        this.renderGameOver(ctx);
        break;
    }

    if (this.toast) {
      ctx.globalAlpha = Math.min(1, this.toast.t / 15);
      drawText(ctx, this.toast.text, W / 2, GROUND_Y - 30, 2, TEXT.small);
      ctx.globalAlpha = 1;
    }

    ui.drawOverlay(ctx, '#ffffff', this.flash);
    ui.drawOverlay(ctx, '#000000', this.fade.a);
  }

  renderTitle(ctx) {
    const bob = Math.round(Math.sin((this.tick * Math.PI * 2) / 48) * 4);
    drawText(ctx, 'FLAPPY BIRD', W / 2, 104 + bob, 3, TEXT.logo);
    ui.drawPlayButton(ctx, PLAY_BTN_TITLE);
    drawText(ctx, 'SPACE / CLICK / TAP', W / 2, 362, 1, TEXT.hint);
    if (this.best > 0) drawText(ctx, `BEST ${this.best}`, W / 2, 150, 2, TEXT.small);
  }

  renderPaused(ctx) {
    ui.drawOverlay(ctx, '#000000', 0.35);
    drawText(ctx, 'PAUSED', W / 2, 200, 3, TEXT.score);
    drawText(ctx, 'P / CLICK TO RESUME', W / 2, 244, 1, TEXT.hint);
  }

  renderGameOver(ctx) {
    const t = this.goT;

    if (t >= TIMING.title) {
      const p = clamp01((t - TIMING.title) / TIMING.titleDur);
      ctx.globalAlpha = p;
      drawText(ctx, 'GAME OVER', W / 2, 110 - Math.sin(p * Math.PI) * 10, 3, TEXT.gameOver);
      ctx.globalAlpha = 1;
    }

    if (t >= TIMING.panel) {
      const p = clamp01((t - TIMING.panel) / TIMING.panelDur);
      const e = 1 - Math.pow(1 - p, 3);
      const y = Math.round(H + (BOARD.y - H) * e);
      const cp = clamp01((t - TIMING.countStart) / TIMING.countDur);
      const shown = Math.round(this.score * cp);
      const done = t >= TIMING.medal;
      ui.drawScoreboard(ctx, {
        ...BOARD,
        y,
        score: shown,
        best: done ? this.best : Math.max(this.prevBest, shown),
        medal: done ? this.medal : null,
        sparkles: done ? this.sparkles : [],
        isNew: done && this.isNew,
      });
    }

    if (t >= TIMING.canRestart) ui.drawPlayButton(ctx, PLAY_BTN_OVER);
  }
}
