const FLAP_KEYS = ['Space', 'ArrowUp', 'KeyW', 'Enter'];

export class KeyboardInput {
  attach(input) {
    window.addEventListener('keydown', (e) => {
      if (FLAP_KEYS.includes(e.code)) {
        e.preventDefault();
        if (!e.repeat) input.push({ type: 'press', source: 'keyboard' });
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (!e.repeat) input.push({ type: 'pause' });
      } else if (e.code === 'KeyM') {
        if (!e.repeat) input.push({ type: 'mute' });
      }
    });
  }
}
