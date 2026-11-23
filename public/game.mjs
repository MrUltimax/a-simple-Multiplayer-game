import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let players = [];
let collectible = null;
const pressedKeys = new Set();
const keyDirections = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right'
};

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#111827';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (collectible) {
    context.fillStyle = collectible.color || '#cd7f32';
    context.beginPath();
    context.arc(collectible.x, collectible.y, collectible.radius || 8, 0, Math.PI * 2);
    context.fill();
  }

  players.forEach((player) => {
    context.font = '26px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(player.avatar || '😀', player.x, player.y);

    context.fillStyle = '#ffffff';
    context.font = '12px monospace';
    context.textBaseline = 'alphabetic';
    context.fillText(`${player.score}`, player.x, player.y - 20);
  });
}

socket.on('update', (state) => {
  players = state.players || [];
  collectible = state.collectible || collectible;
  draw();
});

socket.on('state', (state) => {
  players = state.players || [];
  collectible = state.collectible || collectible;
  draw();
});

window.addEventListener('keydown', (event) => {
  if (keyDirections[event.key]) {
    event.preventDefault();
    pressedKeys.add(keyDirections[event.key]);
  }
});

window.addEventListener('keyup', (event) => {
  if (keyDirections[event.key]) {
    event.preventDefault();
    pressedKeys.delete(keyDirections[event.key]);
  }
});

window.addEventListener('blur', () => {
  pressedKeys.clear();
});

let previousFrameTime = performance.now();

function gameLoop(frameTime) {
  const elapsedSeconds = Math.min((frameTime - previousFrameTime) / 1000, 0.05);
  previousFrameTime = frameTime;

  let horizontal = 0;
  let vertical = 0;
  if (pressedKeys.has('left')) horizontal -= 1;
  if (pressedKeys.has('right')) horizontal += 1;
  if (pressedKeys.has('up')) vertical -= 1;
  if (pressedKeys.has('down')) vertical += 1;

  if (horizontal !== 0 || vertical !== 0) {
    const length = Math.hypot(horizontal, vertical);
    socket.emit('move', {
      x: horizontal / length,
      y: vertical / length,
      elapsedSeconds
    });
  }

  requestAnimationFrame(gameLoop);
}

draw();
requestAnimationFrame(gameLoop);
