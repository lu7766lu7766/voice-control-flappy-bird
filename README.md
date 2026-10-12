# 水管鳥復刻版（Flappy Bird Clone）

照原版手感與畫面復刻，**撐越久分數越高**（每 0.1 秒 +1）。

## 執行

```powershell
npm.cmd install
npm.cmd run dev
```

打開 http://localhost:5173/

> PowerShell 若出現「已停用指令碼執行」，請用 `npm.cmd` 取代 `npm`。

## 操作

| 按鍵 | 功能 |
|---|---|
| `Space` / `↑` / `W` / `Enter`、滑鼠左鍵、觸控 | 拍翅 / 開始 / 重來 |
| `P` / `Esc`、左上角按鈕 | 暫停 |
| `M` | 靜音 |

## 計分與獎牌

- 每 0.1 秒 +1 分
- 獎牌照原版「通過水管數」換算：每根水管約 13 分
  - 銅 130、銀 260、金 390、白金 520（由 `src/config.js` 自動計算）

## 調整手感

所有物理、尺寸、計分參數都在 [`src/config.js`](src/config.js)。

## 結構

```
src/
├─ main.js              進入點、固定 60fps 時間步長
├─ config.js            參數
├─ game.js              狀態機：title → ready → playing → dying → gameover
├─ entities/            bird / pipes / ground
├─ render/              sprites（程式繪製像素圖）、font（像素字型）、ui
├─ audio/sfx.js         Web Audio 合成音效
├─ input/               InputManager（統一介面）、鍵盤、滑鼠/觸控
└─ storage.js           最高分
```

## 下一步：聲音控制

輸入層已抽象化，新增 `src/input/VoiceInput.js` 後用 `input.add(...)` 掛上即可：
- **A 音量拍翅**：音量超過門檻 → 推送 `{ type: 'press' }`
- **B 音調控制高度**：持續呼叫 `input.setTargetY(0~1)`
