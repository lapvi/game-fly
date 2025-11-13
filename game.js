const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Điều chỉnh canvas cho phù hợp với màn hình
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth, 400);
    canvas.height = Math.min(window.innerHeight - 100, 600);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Biến game
let bird = { x: 50, y: 150, width: 30, height: 30, gravity: 0.5, lift: -8, velocity: 0 };
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;

// Vẽ chim
function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// Tạo ống
function createPipe() {
    const gap = 120;
    const topHeight = Math.random() * (canvas.height / 2);
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + gap,
        width: 50
    });
}

// Vẽ ống
function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);
    });
}

// Kiểm tra va chạm
function checkCollision(pipe) {
    if (
        bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
    ) {
        gameOver = true;
    }
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
    }
}

// Cập nhật game
function update() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "32px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2 - 20);
        ctx.font = "20px Arial";
        ctx.fillText("Nhấn ↑ để chơi lại", canvas.width / 2 - 90, canvas.height / 2 + 20);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frame % 90 === 0) createPipe();

    pipes.forEach(pipe => {
        pipe.x -= 2;
        if (pipe.x + pipe.width < 0) {
            pipes.shift();
            score++;
        }
        checkCollision(pipe);
    });

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    drawBird();
    drawPipes();

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);

    frame++;
    requestAnimationFrame(update);
}

// Khi nhấn phím hoặc chạm
function jump() {
    if (gameOver) {
        pipes = [];
        bird.y = 150;
        bird.velocity = 0;
        score = 0;
        frame = 0;
        gameOver = false;
        update();
    } else {
        bird.velocity = bird.lift;
    }
}

document.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") jump();
});

document.getElementById("jumpBtn").addEventListener("touchstart", jump);
document.getElementById("jumpBtn").addEventListener("click", jump);

// Bắt đầu game
update();
