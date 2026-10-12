// 所有尺寸 / 物理 / 計分參數集中在這裡，調手感只要改這個檔案。
// 單位：px 為邏輯像素（畫面 288 × 512），frame 為 1/60 秒的固定時間步長。

export const W = 288;
export const H = 512;
export const GROUND_Y = 400; // 地板上緣，地板高 112
export const STEP = 1 / 60;
export const FPS = 60;

export const PHYS = {
  gravity: 0.25, // px/frame²
  flapVelocity: -4.6, // 拍翅時「直接設定」的速度（原版做法）
  maxFall: 6.5, // 最大下墜速度
  ceiling: -24, // 小鳥最高只能到這裡（不會因頂端死亡）
};

export const BIRD = {
  x: 80, // 遊戲中小鳥的中心 x
  w: 34,
  h: 24,
  radius: 11, // 碰撞圓半徑（比圖片略小，跟原版一樣稍微寬容）
  flapHold: 26, // 拍翅後維持抬頭的 frame 數
  upAngle: -25, // 抬頭角度
  diveSpeed: 3.6, // 開始下墜後每 frame 低頭幾度
  maxAngle: 90, // 最大俯衝角度
};

export const PIPE = {
  w: 52,
  capH: 24,
  gap: 100, // 上下水管間隙
  spacing: 156, // 相鄰水管左緣的距離
  minTop: 80, // 間隙上緣的範圍
  maxTop: 220,
  firstX: W + 60, // 開始後第一根水管出現的位置
};

export const SCROLL = 2; // 水管與地板捲動速度 px/frame（固定不變）

export const SCORE = {
  perSecond: 10, // 每 0.1 秒 +1
};

// 原版獎牌看「通過水管數」，這裡依捲動速度換算成時間分數
const secondsPerPipe = (PIPE.spacing / SCROLL) * STEP;
export const POINTS_PER_PIPE = Math.round(secondsPerPipe * SCORE.perSecond);
export const MEDALS = [
  { name: 'platinum', min: 40 * POINTS_PER_PIPE },
  { name: 'gold', min: 30 * POINTS_PER_PIPE },
  { name: 'silver', min: 20 * POINTS_PER_PIPE },
  { name: 'bronze', min: 10 * POINTS_PER_PIPE },
];

// Game Over 畫面時間軸（frame）
export const TIMING = {
  title: 20,
  titleDur: 16,
  panel: 50,
  panelDur: 24,
  countStart: 78,
  countDur: 32,
  medal: 112,
  canRestart: 112,
  fadeFrames: 14,
  dieSoundDelay: 18,
};
