const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 600;

let player = { x: 160, y: 520, size: 40, speed: 5 };
let obstacles = [];
let score = 0;
let time = 0;
let best = 0;
let gameRunning = false;
let lastSpawn = 0;

const playBtn = document.getElementById("playBtn");
const playScreen = document.getElementById("playScreen");

function resetGame() {
    player.x = 160;
    player.y = 520;
    obstacles = [];
    score = 0;
    time = 0;
    gameRunning = true;
    playScreen.style.display = "none";
    update();
}

function spawnObstacle() {
    const size = 30 + Math.random() * 20;
    const x = Math.random() * (canvas.width - size);
    obstacles.push({ x, y: -size, size, speed: 2 + Math.random() * 3 });
}

function drawPlayer() {
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.arc(player.x + player.size / 2, player.y + player.size / 2, player.size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawObstacles() {
    ctx.fillStyle = "#444";
    obstacles.forEach(o => {
        ctx.beginPath();
        ctx.arc(o.x + o.size / 2, o.y + o.size / 2, o.size / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function update(timestamp) {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn obstacle mỗi 800ms
    if (!lastSpawn || timestamp - lastSpawn > 800) {
        spawnObstacle();
        lastSpawn = timestamp;
    }

    // Cập nhật chướng ngại
    obstacles.forEach(o => (o.y += o.speed));
    obstacles = obstacles.filter(o => o.y < canvas.height);

    // Va chạm
    for (let o of obstacles) {
        const dx = (player.x + player.size / 2) - (o.x + o.size / 2);
        const dy = (player.y + player.size / 2) - (o.y + o.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.size / 2 + o.size / 2) {
            endGame();
            return;
        }
    }

    // Vẽ
    drawPlayer();
    drawObstacles();

    // Cập nhật điểm
    score++;
    time += 0.016;
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("time").innerText = "Time: " + time.toFixed(1) + "s";

    requestAnimationFrame(update);
}

function endGame() {
    gameRunning = false;
    if (score > best) best = score;
    document.getElementById("best").innerText = "Best: " + best;
    playScreen.style.display = "flex";
    playScreen.innerHTML = `
    <h2>💀 Game Over!</h2>
    <p>Score: ${score} | Time: ${time.toFixed(1)}s</p>
    <button id="playBtn">Chơi lại</button>
  `;
    document.getElementById("playBtn").addEventListener("click", resetGame);
}

// Nút trái
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// Desktop
leftBtn.addEventListener("mousedown", () => (player.moveLeft = true));
leftBtn.addEventListener("mouseup", () => (player.moveLeft = false));
rightBtn.addEventListener("mousedown", () => (player.moveRight = true));
rightBtn.addEventListener("mouseup", () => (player.moveRight = false));

// Mobile
leftBtn.addEventListener("touchstart", e => { e.preventDefault(); player.moveLeft = true; });
leftBtn.addEventListener("touchend", e => { e.preventDefault(); player.moveLeft = false; });
rightBtn.addEventListener("touchstart", e => { e.preventDefault(); player.moveRight = true; });
rightBtn.addEventListener("touchend", e => { e.preventDefault(); player.moveRight = false; });
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") player.moveLeft = true;
    if (e.key === "ArrowRight") player.moveRight = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") player.moveLeft = false;
    if (e.key === "ArrowRight") player.moveRight = false;
});

function movePlayer() {
    if (player.moveLeft) player.x -= player.speed;
    if (player.moveRight) player.x += player.speed;
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    requestAnimationFrame(movePlayer);
}

movePlayer();
playBtn.addEventListener("click", resetGame);
