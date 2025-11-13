const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Biến cho game
let bird = { x: 50, y: 150, width: 30, height: 30, gravity: 0.5, lift: -8, velocity: 0 };
let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;

// Hàm vẽ con chim
function drawBird() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// Hàm tạo ống
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

// Hàm vẽ ống
function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        // Ống trên
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        // Ống dưới
        ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);
    });
}

// Hàm xử lý va chạm
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

// Hàm cập nhật khung hình
function update() {
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "32px Arial";
        ctx.fillText("Game Over!", 120, 300);
        ctx.font = "20px Arial";
        ctx.fillText("Nhấn SPACE để chơi lại", 90, 340);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tạo ống mới mỗi 90 frame
    if (frame % 90 === 0) createPipe();

    // Cập nhật vị trí ống
    pipes.forEach(pipe => {
        pipe.x -= 2;
        if (pipe.x + pipe.width < 0) {
            pipes.shift();
            score++;
        }
        checkCollision(pipe);
    });

    // Cập nhật chim
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Vẽ mọi thứ
    drawBird();
    drawPipes();

    // Điểm số
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);

    frame++;
    requestAnimationFrame(update);
}

// Khi nhấn phím
document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        if (gameOver) {
            // Reset game
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
});

// Bắt đầu game
update();
