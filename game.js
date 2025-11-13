const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth, 400);
    canvas.height = Math.min(window.innerHeight - 80, 600);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Ảnh
const dogImg = new Image();
dogImg.src = "dog.png";
const shitImg = new Image();
shitImg.src = "shit.png";
const cloudImg = new Image();
cloudImg.src = "cloud.png"; // bạn có thể dùng ảnh đám mây
const grassImg = new Image();
grassImg.src = "grass.png"; // ảnh cỏ hoặc mặt đất

// Biến game
let bird, pipes, shits, frame, score, gameOver, gameStarted;
let bgX = 0, cloudX = 0, grassX = 0;

function resetGame() {
    bird = { x: 60, y: 200, w: 40, h: 40, g: 0.35, v: 0, lift: -7 };
    pipes = [];
    shits = [];
    frame = 0;
    score = 0;
    gameOver = false;
}

// Khởi tạo
resetGame();
gameStarted = false;

// Nền di chuyển
function drawBackground() {
    // bầu trời
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#6dd5fa");
    grad.addColorStop(1, "#ffffff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // đám mây di chuyển
    cloudX -= 0.3;
    if (cloudImg.complete) {
        ctx.drawImage(cloudImg, cloudX, 50, canvas.width, 100);
        ctx.drawImage(cloudImg, cloudX + canvas.width, 50, canvas.width, 100);
        if (cloudX <= -canvas.width) cloudX = 0;
    }

    // mặt đất di chuyển
    grassX -= 2;
    if (grassImg.complete) {
        ctx.drawImage(grassImg, grassX, canvas.height - 40, canvas.width, 40);
        ctx.drawImage(grassImg, grassX + canvas.width, canvas.height - 40, canvas.width, 40);
        if (grassX <= -canvas.width) grassX = 0;
    }
}

// Tạo ống
function createPipe() {
    const gap = 170;
    const topH = Math.random() * (canvas.height / 2 - 40) + 20;
    pipes.push({ x: canvas.width, top: topH, bottom: topH + gap, w: 50, color: randomColor() });

    if (Math.random() < 0.8) {
        shits.push({
            x: canvas.width + 60,
            y: topH + gap / 2 - 15,
            size: 30,
            collected: false,
            angle: 0,
            floating: 0
        });
    }
}

function randomColor() {
    const colors = ["#4CAF50", "#3CB371", "#5DD39E", "#77DD77"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawPipes() {
    pipes.forEach(pipe => {
        const grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.w, 0);
        grad.addColorStop(0, pipe.color);
        grad.addColorStop(1, "#2e8b57");
        ctx.fillStyle = grad;
        ctx.fillRect(pipe.x, 0, pipe.w, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipe.w, canvas.height - pipe.bottom);
    });
}

// Vẽ shit xoay tròn
function drawShits() {
    shits.forEach(s => {
        if (!s.collected) {
            s.angle += 0.1;
            s.floating = Math.sin(frame / 10) * 2;
            ctx.save();
            ctx.translate(s.x + s.size / 2, s.y + s.size / 2 + s.floating);
            ctx.rotate(s.angle);
            ctx.drawImage(shitImg, -s.size / 2, -s.size / 2, s.size, s.size);
            ctx.restore();
        }
    });
}

function drawBird() {
    if (dogImg.complete) ctx.drawImage(dogImg, bird.x, bird.y, bird.w, bird.h);
    else {
        ctx.fillStyle = "brown";
        ctx.fillRect(bird.x, bird.y, bird.w, bird.h);
    }
}

function checkCollision(pipe) {
    if (
        bird.x < pipe.x + pipe.w &&
        bird.x + bird.w > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.h > pipe.bottom)
    ) gameOver = true;
    if (bird.y + bird.h > canvas.height - 40 || bird.y < 0) gameOver = true;
}

function checkCollect(s) {
    if (!s.collected &&
        bird.x < s.x + s.size &&
        bird.x + bird.w > s.x &&
        bird.y < s.y + s.size &&
        bird.y + bird.h > s.y) {
        s.collected = true;
        score += 5;
        // hiệu ứng nổi điểm
        ctx.fillStyle = "yellow";
        ctx.font = "bold 20px Arial";
        ctx.fillText("+5!", s.x, s.y - 10);
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    if (!gameStarted) return;

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "32px Poppins";
        ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2 - 20);
        ctx.font = "20px Poppins";
        ctx.fillText("Điểm: " + score, canvas.width / 2 - 40, canvas.height / 2 + 15);
        ctx.fillText("Nhấn ↑ để chơi lại", canvas.width / 2 - 90, canvas.height / 2 + 45);
        return;
    }

    if (frame % 160 === 0) createPipe();

    pipes.forEach(p => {
        p.x -= 2;
        checkCollision(p);
    });
    pipes = pipes.filter(p => p.x + p.w > 0);

    shits.forEach(s => {
        s.x -= 2;
        checkCollect(s);
    });
    shits = shits.filter(s => s.x + s.size > 0);

    bird.v += bird.g;
    bird.y += bird.v;

    drawPipes();
    drawShits();
    drawBird();

    ctx.fillStyle = "#000";
    ctx.font = "18px Poppins";
    ctx.fillText("Điểm: " + score, 10, 25);

    frame++;
    requestAnimationFrame(update);
}

// Điều khiển
function jump() {
    if (gameOver) {
        resetGame();
        update();
    } else {
        bird.v = bird.lift;
        gameStarted = true;
    }
}

document.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") jump();
});
document.getElementById("jumpBtn").addEventListener("touchstart", jump);
document.getElementById("jumpBtn").addEventListener("click", jump);

// Nút bắt đầu
document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("menu").style.display = "none";
    update();
});
