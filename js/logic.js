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
</style>
<canvas id="jjump-canvas"></canvas>
<div id="score">
    <p>Score: 0</p>
</div>
<div id="fps">
    <p>FPS: 0</p>
</div>`
}
buildBaseHTML();
const gameScore = document.getElementById('score');
const gameFPS = document.getElementById('fps');
const canvas = document.getElementById('jjump-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

const jay = new Jay();
jay.position.y = floor - jay.size.height;
jay.position.x = 50

const obstacles = [];

function update() {

    if (jay.isJumping) {
        jay.position.y -= jay.velocity;
        jay.velocity -= 0.5;
        if (jay.position.y >= floor - jay.size.height) {
            jay.position.y = floor - jay.size.height;
            jay.isJumping = false;
        }
    }

    obstacles.forEach(obstacle => {
        obstacle.update();
        if (obstacle.isColliding(jay)) {
            isGameOver = true;
            obstacle.stop();
        }
        if (obstacle.isOffScreen()) {
            obstacle.reset(canvas, floor);
            score++;
        }
        // update level speed
        if (score % 3 === 0 && score !== 0) {
            obstacle.speed += 0.02;
        }
    });

    // Spawn 1 obstacle only in screen
    if (obstacles.length === 0) {
        const obstacle = new Obstacle();
        obstacle.position.x = canvas.width + Math.random() * 1000;
        obstacle.position.y = floor - obstacle.size.height;
        obstacles.push(obstacle);
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    jay.draw(ctx);

    // Draw floor
    ctx.fillStyle = '#232323';
    ctx.fillRect(0, floor, canvas.width, canvas.height - floor);

    // Draw obstacles
    obstacles.forEach(obstacle => {
        obstacle.draw(ctx);
    });


    // Update score
    gameScore.innerHTML = `<p>Score: ${score}</p>`;

    // Update FPS
    gameFPS.innerHTML = `<p>FPS: ${fps}</p>`;

    if (isGameOver) {
        ctx.fillStyle = '#232323';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press R to restart', canvas.width / 2 - 150, canvas.height / 2 + 50);
    }

}

const restartGame = () => {
    isGameOver = false;
    score = 0;
    jay.position.y = floor - jay.size.height;
    jay.position.x = 50;
    obstacles.forEach(obstacle => {
        obstacle.reset(canvas, floor);
        obstacle.speed = 5;
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w') {
        jay.jump();
    }
    if (isGameOver && event.key === 'r') {
        restartGame();
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