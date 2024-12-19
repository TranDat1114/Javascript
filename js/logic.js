function buildBaseHTML() {
    const body = document.body;
    body.innerHTML = `
    <style>
    body {
        /* reset css */
        margin: 0;
        overflow: hidden;
        padding: 0;
        background: #232323;
        font-family: "PlaywriteMxGuides";
        color: antiquewhite;
    }
    #score {
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 20px;
    }

    #jjump-canvas {
        display: block;
        background: #323232;
    }
    #fps {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 20px;
    }
    #mute-background-btn {
        position: absolute;
        bottom: 10px;
        right: 10px;
    }
</style>
<canvas id="jjump-canvas"></canvas>
<div id="score">
    <p>Score: 0</p>
</div>
<div id="fps">
    <p>Fps: 0</p>
</div>
<div id="mute-background-btn">
    Mute
</div>
`


}
buildBaseHTML();
const gameScore = document.getElementById('score');
const gameFPS = document.getElementById('fps');
const canvas = document.getElementById('jjump-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Sounds
const jumpSound = new Audio('sounds/jump.mp3');
const hitSound = new Audio('sounds/game-over.mp3');
const levelUpSound = new Audio('sounds/level-up.mp3');
const backgroundMusic = new Audio('sounds/background-music.mp3');

const muteBackgroundBtn = document.getElementById('mute-background-btn');

muteBackgroundBtn.addEventListener('click', () => {
    if (isBackgroundMusicPlaying) {
        backgroundMusic.pause();
        isBackgroundMusicPlaying = false;
        muteBackgroundBtn.innerText = 'un Mute';
    } else {
        backgroundMusic.play();
        isBackgroundMusicPlaying = true;
        muteBackgroundBtn.innerText = 'Mute';
    }
});


jumpSound.volume = 0.1; // Điều chỉnh âm lượng
hitSound.volume = 0.1; // Điều chỉnh âm lượng
levelUpSound.volume = 0.1; // Điều chỉnh âm lượng

const playJumpSound = async () => {
    jumpSound.currentTime = 0;
    jumpSound.play();
}

const playLevelUpSound = async () => {
    levelUpSound.currentTime = 0;
    levelUpSound.play();
}

const playHitSound = async () => {
    hitSound.currentTime = 0;
    hitSound.play();
}

// Phát nhạc nền lặp lại
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1; // Điều chỉnh âm lượng


//global variables
let FPS = 60;
let FRAME_DURATION = 1000 / FPS;
let lastFrameTime = 0;

let fps = 0;
let frameCount = 0;
let lastFPSUpdate = 0;

function updateFPS(currentTime) {
    if (currentTime - lastFPSUpdate >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFPSUpdate = currentTime;
        // console.log(`FPS: ${fps}`);
    }
    frameCount++;
}

// Environment variables
const gravity = 1;

const floor = canvas.height - 250;

// Game variables
let score = 0;
let isGameOver = false;
let isGamePaused = false;
let isMenuOpen = true;

let isBackgroundMusicPlaying = false;

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset về đầu
    isBackgroundMusicPlaying = false;
}

class Jay {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.size = {
            width: 50,
            height: 50
        }
        this.velocity = 0;
        this.isJumping = false;
    }
    jump() {
        if (this.isJumping) return;
        playJumpSound();
        this.isJumping = true;
        this.velocity = 10;
    }
    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
    down() {
        //down floor when jump
        if (this.isJumping) {
            this.position.y = floor - this.size.height;
        }
    }
}

class Obstacle {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.size = {
            width: 25,
            height: 50
        }
        this.speed = 5;
    }
    draw(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update() {
        // Move obstacle to the left and increase speed every 3 points
        this.position.x -= this.speed;
    }

    stop() {
        this.speed = 0;
    }

    isColliding(jay) {
        return this.position.x < jay.position.x + jay.size.width &&
            this.position.x + this.size.width > jay.position.x &&
            this.position.y < jay.position.y + jay.size.height &&
            this.position.y + this.size.height > jay.position.y;
    }

    isOffScreen() {
        return this.position.x + this.size.width < 0;
    }

    reset(canvas, floor) {
        this.position.x = canvas.width + Math.random() * 1000;
        this.position.y = floor - this.size.height;
    }
}

const jay = new Jay();
jay.position.y = floor - jay.size.height;
jay.position.x = 50

const obstacle = new Obstacle();

function update() {
    if (isMenuOpen) {
        return;
    }

    obstacle.update();
    if (obstacle.isColliding(jay)) {
        obstacle.stop();
        // stopBackgroundMusic();
        isGameOver = true;
        return;
    }
    // update level speed
    if (score % 3 === 0 && score !== 0) {
        obstacle.speed += 0.02;
    }

    if (score % 5 === 0 && score !== 0) {
        playLevelUpSound();
    }
    if (obstacle.isOffScreen()) {
        obstacle.reset(canvas, floor);
        score++;
    }

    if (jay.isJumping) {
        jay.position.y -= jay.velocity;
        jay.velocity -= 0.5;
        if (jay.position.y >= floor - jay.size.height) {
            jay.position.y = floor - jay.size.height;
            jay.isJumping = false;
        }
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update FPS
    gameFPS.innerHTML = `<p>Fps: ${fps}</p>`;

    if (isMenuOpen) {
        ctx.fillStyle = '#232323';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '50px PlaywriteMxGuides';
        ctx.fillText('JJUMP', canvas.width / 2 - 150, canvas.height / 2);
        ctx.font = '20px PlaywriteMxGuides';
        ctx.fillText('Press any key to start', canvas.width / 2 - 150, canvas.height / 2 + 50);
        return;
    }

    if (isGameOver) {
        ctx.fillStyle = '#232323';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '30px PlaywriteMxGuides';
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
        ctx.font = '20px PlaywriteMxGuides';
        ctx.fillText('Press R to restart', canvas.width / 2 - 150, canvas.height / 2 + 50);
        return;
    }

    jay.draw(ctx);

    // Draw floor
    ctx.fillStyle = '#232323';
    ctx.fillRect(0, floor, canvas.width, canvas.height - floor);

    // Draw obstacles
    obstacle.draw(ctx);

    // Update score
    gameScore.innerHTML = `<p>Score: ${score}</p>`;
}

const restartGame = () => {
    isGameOver = false;
    score = 0;
    jay.position.y = floor - jay.size.height;
    jay.position.x = 50;
    obstacle.reset(canvas, floor);
    obstacle.speed = 5;

    // backgroundMusic.play();
}

document.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w') {
        if (isMenuOpen) {
            isMenuOpen = false;
            backgroundMusic.play();
            return;
        }
        if (!isGameOver) {
            jay.jump();
            return
        } else {
            restartGame();
        }
    }
    if (event.key === 's') {
        jay.down();
    }
    if (isGameOver && event.key === 'r') {
        restartGame();
    }
});

canvas.addEventListener('pointerdown', () => {
    event.preventDefault(); // Ngăn cuộn hoặc zoom
    if (event.isPrimary) { // Chỉ xử lý con trỏ chính
        if (isMenuOpen) {
            isMenuOpen = false;
            backgroundMusic.play();
            return;
        }

        if (!isGameOver) {
            jay.jump();
            return;
        } else {
            restartGame();
        }
    }
});


function gameLoop(currentTime) {
    // const deltaTime = currentTime - lastFrameTime;
    // if (deltaTime >= FRAME_DURATION) {
    //     lastFrameTime = currentTime;
    //     update();
    //     render();
    //     updateFPS(currentTime);
    // }
    update();
    render();
    updateFPS(currentTime);
    setTimeout(requestAnimationFrame(gameLoop), FRAME_DURATION);
}

requestAnimationFrame(gameLoop);