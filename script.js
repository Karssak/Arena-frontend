const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");

const arenaWidth = canvas.width;
const arenaHeight = canvas.height;

const player = {
  x: Math.floor(Math.random() * (arenaWidth - 2 * 20)) + 20,
  y: Math.floor(Math.random() * (arenaHeight - 2 * 20)) + 20,
  size: 20,
  color: "#3498db",
  speed: 2,
};

const bots = [];
const numBots = 20;
const botSize = 20;

for (let i = 0; i < numBots; i++) {
  bots.push({
    x: Math.floor(Math.random() * (arenaWidth - botSize)),
    y: Math.floor(Math.random() * (arenaHeight - botSize)),
    size: botSize,
    color: getRandomColor(),
    speed: Math.random() * 2 + 1,
    dx: Math.random() < 0.5 ? 1 : -1,
    dy: Math.random() < 0.5 ? 1 : -1,
  });
}

const keysPressed = {
  w: false,
  a: false,
  s: false,
  d: false,
};

const worker = new SharedWorker("shared-worker.js");
worker.port.start();

function setupArena() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
}

function drawGrid(cellSize = 50) {
  ctx.strokeStyle = "#ffffff";
  for (let x = 0; x <= arenaWidth; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, arenaHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= arenaHeight; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(arenaWidth, y);
    ctx.stroke();
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(
    player.x - player.size / 2,
    player.y - player.size / 2,
    player.size,
    player.size
  );
}

function drawBots() {
  bots.forEach((bot) => {
    ctx.fillStyle = bot.color;
    ctx.fillRect(
      bot.x - bot.size / 2,
      bot.y - bot.size / 2,
      bot.size,
      bot.size
    );
  });
}

function render() {
  setupArena();
  drawGrid();
  drawPlayer();
  drawBots();
}

function updatePosition() {
  let dx = 0;
  let dy = 0;

  if (keysPressed.w) dy = -player.speed;
  if (keysPressed.a) dx = -player.speed;
  if (keysPressed.s) dy = player.speed;
  if (keysPressed.d) dx = player.speed;

  const newX = player.x + dx;
  const newY = player.y + dy;

  if (newX - player.size / 2 >= 0 && newX + player.size / 2 <= arenaWidth) {
    player.x = newX;
  }
  if (newY - player.size / 2 >= 0 && newY + player.size / 2 <= arenaHeight) {
    player.y = newY;
  }

  bots.forEach((bot) => {
    if (checkCollision(player, bot)) {
      player.x -= dx;
      player.y -= dy;
    }
  });

  if (dx !== 0 || dy !== 0) {
    sendMovement({ x: dx, y: dy });
  }

  bots.forEach((bot) => {
    bot.x += bot.dx * bot.speed;
    bot.y += bot.dy * bot.speed;

    if (bot.x <= bot.size / 2 || bot.x >= arenaWidth - bot.size / 2)
      bot.dx *= -1;
    if (bot.y <= bot.size / 2 || bot.y >= arenaHeight - bot.size / 2)
      bot.dy *= -1;

    bots.forEach((otherBot) => {
      if (bot !== otherBot && checkCollision(bot, otherBot)) {
        resolveCollision(bot, otherBot);
      }
    });
  });
}

function checkCollision(entity1, entity2) {
  const dx = entity1.x - entity2.x;
  const dy = entity1.y - entity2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < entity1.size / 2 + entity2.size / 2;
}

function resolveCollision(bot1, bot2) {
  bot1.dx *= -1;
  bot1.dy *= -1;
  bot2.dx *= -1;
  bot2.dy *= -1;

  const overlapX = bot1.x - bot2.x;
  const overlapY = bot1.y - bot2.y;
  const overlapDist = Math.sqrt(overlapX * overlapX + overlapY * overlapY);
  const overlap = bot1.size / 2 + bot2.size / 2 - overlapDist;

  const angle = Math.atan2(overlapY, overlapX);
  bot1.x += (Math.cos(angle) * overlap) / 2;
  bot1.y += (Math.sin(angle) * overlap) / 2;
  bot2.x -= (Math.cos(angle) * overlap) / 2;
  bot2.y -= (Math.sin(angle) * overlap) / 2;
}

function sendMovement(direction) {
  worker.port.postMessage({
    type: "move",
    user: "player",
    direction: direction,
  });
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (keysPressed[key] !== undefined) {
    keysPressed[key] = true;

    sendMovement({
      x: keysPressed.d - keysPressed.a,
      y: keysPressed.s - keysPressed.w,
    });
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (keysPressed[key] !== undefined) {
    keysPressed[key] = false;
  }
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

function gameLoop() {
  updatePosition();
  render();
  requestAnimationFrame(gameLoop);
}

function init() {
  render();
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  gameLoop();
}

worker.port.onmessage = function (event) {
  const data = JSON.parse(event.data);

  if (data.type === "move" && data.user !== "player") {
    console.log("Received movement from other user:", data);
  }
};

init();
