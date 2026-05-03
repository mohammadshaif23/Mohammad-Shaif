const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const messageEl = document.getElementById('message');
const liveEl = document.getElementById('live');
const restartBtn = document.getElementById('restart');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const targetScore = 12;

let snake;
let direction;
let pendingDirection;
let apple;
let rock;
let score;
let best = Number(localStorage.getItem('snakeBest') || 0);
let tickId;
let gameOver;

function randomCell(excluded = []) {
  while (true) {
    const pos = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
    const blocked = excluded.some((p) => p.x === pos.x && p.y === pos.y);
    if (!blocked) return pos;
  }
}

function announce(text) {
  liveEl.textContent = text;
}

function setMessage(text, tone = '') {
  messageEl.className = `message ${tone}`.trim();
  messageEl.textContent = text;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  pendingDirection = direction;
  score = 0;
  gameOver = false;
  apple = randomCell(snake);
  rock = randomCell([...snake, apple]);
  scoreEl.textContent = score;
  bestEl.textContent = best;
  setMessage('Game started. Reach 12 points to win!', 'good');
  announce('Game started');

  clearInterval(tickId);
  tickId = setInterval(gameLoop, 135);
  draw();
}

function gameLoop() {
  if (gameOver) return;

  direction = pendingDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    endGame('You hit a wall. Press Restart to try again.');
    return;
  }

  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    endGame('You ran into yourself. Press Restart to try again.');
    return;
  }

  snake.unshift(head);

  const ateApple = head.x === apple.x && head.y === apple.y;
  const ateRock = head.x === rock.x && head.y === rock.y;

  if (ateApple) {
    score += 1;
    apple = randomCell([...snake, rock]);
    announce(`Apple eaten. Score ${score}`);
  } else {
    snake.pop();
  }

  if (ateRock) {
    score -= 1;
    rock = randomCell([...snake, apple]);
    announce(`Rock hit. Score ${score}`);
  }

  scoreEl.textContent = score;

  if (score > best) {
    best = score;
    localStorage.setItem('snakeBest', String(best));
    bestEl.textContent = best;
  }

  if (score >= targetScore) {
    endGame('🎉 You win! You reached 12 points!', 'good');
    return;
  }

  draw();
}

function endGame(text, tone = 'bad') {
  gameOver = true;
  clearInterval(tickId);
  setMessage(text, tone);
  announce(text);
}

function drawTile(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
}

function draw() {
  ctx.fillStyle = '#d1fae5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawTile(apple.x, apple.y, '#ef4444');
  drawTile(rock.x, rock.y, '#6b7280');

  snake.forEach((part, idx) => {
    drawTile(part.x, part.y, idx === 0 ? '#065f46' : '#10b981');
  });
}

window.addEventListener('keydown', (e) => {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const move = keyMap[e.key] || keyMap[e.key.toLowerCase()];
  if (!move) return;

  if (move.x === -direction.x && move.y === -direction.y) return;
  pendingDirection = move;
});

restartBtn.addEventListener('click', resetGame);

resetGame();
