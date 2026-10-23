/* Appearance controls and foliage adapted from the supplied design export. */
(() => {
  const modes = new Set(['light', 'dark', 'shade']);
  let mode = 'light';

  try {
    const saved = localStorage.getItem('jc-mode');
    if (modes.has(saved)) mode = saved;
  } catch {
    // Appearance controls also work when browser storage is unavailable.
  }

  const applyPalette = () => {
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.ground = mode === 'dark' ? 'dark' : 'light';
  };

  // Set the saved palette before the stylesheets load to avoid a light flash.
  applyPalette();

  function buildShade(container) {
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const branches = [
      { x: 104, y: -6, angle: 148, length: 900, depth: 0 },
      { x: 98, y: 38, angle: 172, length: 640, depth: 0 },
      { x: -4, y: 8, angle: 22, length: 720, depth: 0 },
      { x: 108, y: 70, angle: 196, length: 560, depth: 1 },
      { x: 30, y: -8, angle: 70, length: 520, depth: 1 },
    ];

    function element(className, styles) {
      const node = document.createElement('div');
      node.className = className;
      for (const [property, value] of Object.entries(styles)) {
        node.style.setProperty(property, value);
      }
      return node;
    }

    function leaf(position, side) {
      const width = 34 + random() * 30;
      const height = width * (0.42 + random() * 0.12);
      return element('shade-leaf', {
        left: `${position}px`,
        top: `${side > 0 ? 0 : -height}px`,
        width: `${width}px`,
        height: `${height}px`,
        'border-radius': side > 0 ? '0 100% 0 100%' : '100% 0 100% 0',
        'transform-origin': side > 0 ? 'left top' : 'left bottom',
        '--a': `${side * (25 + random() * 30)}deg`,
        '--s': `${3 + random() * 5}deg`,
        '--duration': `${2.6 + random() * 2.4}s`,
        '--delay': `${-random() * 5}s`,
      });
    }

    function twig(position, length) {
      const leaves = [];
      const count = Math.floor(length / 22);
      for (let i = 0; i < count; i++) {
        leaves.push(leaf(10 + i * (length / count), i % 2 ? 1 : -1));
      }
      leaves.push(leaf(length - 6, 0.2));

      const node = element('shade-twig', {
        left: `${position}px`,
        '--a': `${(random() > 0.5 ? 1 : -1) * (28 + random() * 32)}deg`,
        '--s': `${2 + random() * 3}deg`,
        '--duration': `${4 + random() * 3}s`,
        '--delay': `${-random() * 6}s`,
      });
      node.append(element('shade-stem', {
        top: '-1.5px', width: `${length}px`, height: '3px', 'border-radius': '2px',
      }), ...leaves);
      return node;
    }

    for (const depth of [1, 0]) {
      const layer = element('shade-layer', {
        filter: `blur(${depth === 1 ? 16 : 5}px)`,
        opacity: depth === 1 ? '0.12' : '0.2',
        '--duration': `${14 + depth * 5}s`,
      });

      for (const branch of branches.filter(item => item.depth === depth)) {
        const twigs = [];
        for (let position = 80; position < branch.length; position += 55 + random() * 45) {
          twigs.push(twig(position, 110 + random() * 130));
        }
        const node = element('shade-branch', {
          left: `${branch.x}%`,
          top: `${branch.y}%`,
          '--a': `${branch.angle}deg`,
          '--s': `${1.2 + random()}deg`,
          '--duration': `${8 + random() * 4}s`,
          '--delay': `${-random() * 8}s`,
        });
        node.append(element('shade-stem', {
          top: '-5px', width: `${branch.length}px`, height: '10px', 'border-radius': '5px',
        }), ...twigs);
        layer.append(node);
      }
      container.append(layer);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const controls = document.querySelector('.mode-switcher');
    const buttons = controls.querySelectorAll('button[data-mode]');
    const shade = document.getElementById('shade');

    function render() {
      applyPalette();
      for (const button of buttons) {
        button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
      }
      if (mode === 'shade' && !shade.hasChildNodes()) buildShade(shade);
      shade.hidden = mode !== 'shade';
    }

    for (const button of buttons) {
      button.addEventListener('click', () => {
        mode = button.dataset.mode;
        try {
          localStorage.setItem('jc-mode', mode);
        } catch {
          // The selected mode still applies for this page visit.
        }
        render();
      });
    }

    render();
    controls.hidden = false;
  });
})();
