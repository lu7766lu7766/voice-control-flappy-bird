/**
 * 統一輸入介面。所有控制器（鍵盤、滑鼠/觸控、之後的麥克風）都只把「指令」推進來，
 * 遊戲本身不知道輸入是從哪裡來的。
 *
 * 事件格式：
 *   { type: 'press', source, x?, y? }  拍翅 / 開始 / 重來（x, y 為邏輯座標，按鈕判定用）
 *   { type: 'pause' }                  暫停切換
 *   { type: 'mute' }                   靜音切換
 *
 * 連續控制（第二版「音調控制高度」用）：
 *   setTargetY(0~1 | null)              1 = 畫面頂端，0 = 地板上方，null = 無訊號
 */
export class InputManager {
  constructor() {
    this.queue = [];
    this.targetY = null;
    this.sources = [];
  }

  add(source) {
    source.attach(this);
    this.sources.push(source);
    return this;
  }

  push(event) {
    this.queue.push(event);
  }

  setTargetY(value) {
    this.targetY = value;
  }

  /** 每個固定時間步長呼叫一次，取走累積的事件 */
  poll() {
    const events = this.queue;
    this.queue = [];
    return { events, targetY: this.targetY };
  }
}
