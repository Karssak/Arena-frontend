const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");

const arenaWidth = canvas.width;
const arenaHeight = canvas.height;

const circle = {
  x: Math.floor(Math.random() * (arenaWidth - 2 * 20)) + 20,
  y: Math.floor(Math.random() * (arenaHeight - 2 * 20)) + 20,
  radius: 20,
  color: "#3498db",
  speed: 2,
};

const userId = "asdfjahsdfhiqewrqwer";

const keysPressed = {
  w: false,
  a: false,
  s: false,
  d: false,
};

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

function drawCircle() {
  ctx.fillStyle = circle.color;
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  setupArena();
  drawGrid();
  drawCircle();
}

function updatePosition() {
  let dx = 0;
  let dy = 0;

  if (keysPressed.w) dy = -circle.speed;
  if (keysPressed.a) dx = -circle.speed;
  if (keysPressed.s) dy = circle.speed;
  if (keysPressed.d) dx = circle.speed;

  const newX = circle.x + dx;
  const newY = circle.y + dy;

  if (newX - circle.radius >= 0 && newX + circle.radius <= arenaWidth) {
    circle.x = newX;
  }
  if (newY - circle.radius >= 0 && newY + circle.radius <= arenaHeight) {
    circle.y = newY;
  }

  if (dx !== 0 || dy !== 0) {
    const movementLog = {
      type: "move",
      user: userId,
      direction: {
        x: dx !== 0 ? dx / Math.abs(dx) : 0,
        y: dy !== 0 ? dy / Math.abs(dy) : 0,
      },
    };
    console.log(JSON.stringify(movementLog));
  }
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (keysPressed[key] !== undefined) {
    keysPressed[key] = true;
  }
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (keysPressed[key] !== undefined) {
    keysPressed[key] = false;
  }
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

init();