
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
        this.isJumping = true;
        this.velocity = 10;
    }
    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
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