const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---- CẤU HÌNH GAME ----
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth, 400);
    canvas.height = Math.min(window.innerHeight - 100, 600);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---- HÌNH ẢNH ----
const dogImg = new Image();
dogImg.src = "dog.png";

const shitImg = new Image();
shitImg.src = "shit.png";

// ---- BIẾN GAME ----
let bird = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    gravity: 0.4,     // nhẹ hơn
    lift: -7,         // bay dễ hơn
    velocity: 0
};

let pipes = [];
let shits = [];
let frame = 0;
let score = 0;
let gameOver = false;

// ---- HÀM VẼ ----
function drawBird() {
    if (dogImg.complete) {
        ctx.drawImage(dogImg, bird.x, bird.y, bird.width, bird.height);
    } else {
        ctx.fillStyle = "brown";
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    }
}

function createPipe() {
    const gap = 160; // to hơn => dễ hơn
    const topHeight = Math.random() * (canvas.height / 2 - 50) + 20;
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + gap,
        width: 50
    });

    // Thỉnh thoảng sinh ra "shit" giữa khoảng trống
    if (Math.random() < 0.6) {
        shits.push({
            x: canvas.width + 100,
            y: topHeight + gap / 2 - 15,
            size: 30,
            collected: false
        });
    }
}

function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);
    });
}

function drawShits() {
    shits.forEach(shit => {
        if (!shit.collected) {
            if (shitImg.complete) {
                ctx.drawImage(shitImg, shit.x, shit.y, shit.size, shit.size);
            } else {
                ctx.fillStyle = "brown";
                ctx.beginPath();
                ctx.arc(shit.x + 15, shit.y + 15, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

// ---- VA CHẠM ----
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

function checkCollectShit(shit) {
    if (!shit.collected &&
        bird.x < shit.x + shit.size &&
        bird.x + bird.width > shit.x &&
        bird.y < shit.y + shit.size &&
        bird.y + bird.height > shit.y
    ) {
        shit.collected = true;
        score += 3; // mỗi "shit" cộng 3 điểm
    }
}

// ---- CẬP NHẬT ----
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

    // Sinh pipe chậm hơn => dễ hơn
    if (frame % 160 === 0) createPipe();

    // Cập nhật ống
    pipes.forEach(pipe => {
        pipe.x -= 2;
        checkCollision(pipe);
    });
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    // Cập nhật "shit"
    shits.forEach(shit => {
        shit.x -= 2;
        checkCollectShit(shit);
    });
    shits = shits.filter(shit => shit.x + shit.size > 0);

    // Vật lý con chó
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Vẽ
    drawPipes();
    drawShits();
    drawBird();

    // Điểm
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);

    // Cộng điểm khi qua ống
    pipes.forEach(pipe => {
        if (pipe.x + pipe.width === bird.x) score++;
    });

    frame++;
    requestAnimationFrame(update);
}

// ---- ĐIỀU KHIỂN ----
function jump() {
    if (gameOver) {
        // reset
        pipes = [];
        shits = [];
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

const btn = document.getElementById("jumpBtn");
btn.addEventListener("touchstart", jump);
btn.addEventListener("click", jump);

// ---- BẮT ĐẦU ----
update();
