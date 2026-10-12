// 程式繪製的像素圖（原版美術是 144×256 解析度再放大 2 倍，這裡同樣以 2 倍繪製）

const OUTLINE = '#543847';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** 依字元地圖畫像素，'.' 為透明 */
function paint(g, rows, palette, ox = 0, oy = 0) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = palette[row[x]];
      if (!color) continue;
      g.fillStyle = color;
      g.fillRect(ox + x, oy + y, 1, 1);
    }
  });
}

function fromMap(rows, palette) {
  const c = makeCanvas(rows[0].length, rows.length);
  paint(c.getContext('2d'), rows, palette);
  return c;
}

// ---------- 小鳥 17×12 ----------
const BIRD_BODY = [
  '......KKKKKK.....',
  '....KKLLLKWWK....',
  '...KLLYYKWWWWK...',
  '..KLYYYYKWWWKWK..',
  '.KYYYYYYKWWWKWK..',
  '.KYYYYYYYKWWWWK..',
  '.KYYYYYYYYKKKKKK.',
  '.KYYYYYYYKRRRRRRK',
  '..KOOOOOKRKKKKKK.',
  '...KOOOOOKRRRRRK.',
  '....KKOOOOKKKKK..',
  '......KKKKK......',
];

const BIRD_WINGS = [
  {
    oy: 1, // 翅膀往上
    rows: ['..KK...', '.KWWK..', 'KWWWWK.', 'KWWWWWK', 'KYWWWYK', '.KKKKK.'],
  },
  {
    oy: 3, // 中間
    rows: ['.KKKK..', 'KWWWWK.', 'KWWWWWK', 'KYWWWYK', '.KYYYK.'],
  },
  {
    oy: 5, // 往下
    rows: ['.KKKKK.', 'KYWWWYK', 'KWWWWWK', '.KWWWK.', '..KKK..'],
  },
];

const BIRD_COLORS = {
  yellow: { K: OUTLINE, W: '#ffffff', L: '#fcf2a8', Y: '#f8c630', O: '#f2851e', R: '#f6532c' },
  red: { K: OUTLINE, W: '#ffffff', L: '#ffc49a', Y: '#f0703a', O: '#c43a22', R: '#fbb03b' },
  blue: { K: OUTLINE, W: '#ffffff', L: '#c4f1fb', Y: '#4ab8e8', O: '#2a7fc0', R: '#f6532c' },
};

// ---------- 水管 ----------
const PIPE_PAL = { K: OUTLINE, H: '#e4fd8b', L: '#9ce659', M: '#73bf2e', D: '#558022' };
const PIPE_BODY = 'KLHHLMMMMMMMMMMMMDMDDDDK'; // 24
const PIPE_CAP = 'KLHHLLMMMMMMMMMMMMDMDDDDDK'; // 26

// ---------- 小圖示 ----------
const HAND = [
  '....KK......',
  '...KWWK.....',
  '...KWWK.....',
  '...KWWKKK...',
  '...KWWKWWKK.',
  '.KKKWWKWWKWK',
  'KWWKWWWWWKWK',
  'KWWWWWWWWWWK',
  '.KWWWWWWWWWK',
  '..KWWWWWWWK.',
  '...KWWWWWK..',
  '...KKKKKKK..',
];
const ARROW = ['...K...', '..KWK..', '.KWWWK.', 'KKWWWKK', '..KWK..', '..KKK..'];

function buildGround() {
  // 原生解析度 168×56（畫的時候放大 2 倍），條紋週期 12，可無縫捲動
  const w = 168;
  const h = 56;
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = '#ded895';
  g.fillRect(0, 0, w, h);
  g.fillStyle = OUTLINE;
  g.fillRect(0, 0, w, 1);
  g.fillStyle = '#e4fd8b';
  g.fillRect(0, 1, w, 1);
  for (let y = 2; y < 7; y++) {
    for (let x = 0; x < w; x++) {
      g.fillStyle = (x + y) % 12 < 6 ? '#9ce659' : '#73bf2e';
      g.fillRect(x, y, 1, 1);
    }
  }
  g.fillStyle = '#558022';
  g.fillRect(0, 7, w, 1);
  g.fillStyle = '#d7a84c';
  g.fillRect(0, 8, w, 1);
  g.fillStyle = '#e8e2a6';
  g.fillRect(0, 9, w, 1);
  return c;
}

export function buildSprites() {
  const birds = {};
  for (const [name, pal] of Object.entries(BIRD_COLORS)) {
    birds[name] = BIRD_WINGS.map((wing) => {
      const c = makeCanvas(17, 12);
      const g = c.getContext('2d');
      paint(g, BIRD_BODY, pal);
      paint(g, wing.rows, pal, 0, wing.oy);
      return c;
    });
  }

  const pipeBody = fromMap([PIPE_BODY], PIPE_PAL);
  const capRows = [
    'K'.repeat(26),
    ...Array(9).fill(PIPE_CAP),
    PIPE_CAP.replace(/[HL]/g, 'M'),
    'K'.repeat(26),
  ];
  const pipeCap = fromMap(capRows, PIPE_PAL);

  return {
    birds,
    pipeBody,
    pipeCap,
    ground: buildGround(),
    hand: fromMap(HAND, { K: OUTLINE, W: '#ffffff' }),
    arrow: fromMap(ARROW, { K: OUTLINE, W: '#ffffff' }),
  };
}

export function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}
