// Basic script for Pac-Man game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 40;
const rows = canvas.height / tileSize;
const cols = canvas.width / tileSize;

const pacman = {
    x: tileSize,
    y: tileSize,
    dx: tileSize,
    dy: 0,
    size: tileSize / 2
};

function drawPacman() {
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.size, 0.2 * Math.PI, 1.8 * Math.PI); // Pacman shape
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

function update() {
    pacman.x += pacman.dx;
    pacman.y += pacman.dy;

    // Boundary collision
    if (pacman.x < pacman.size) pacman.x = canvas.width - pacman.size;
    if (pacman.x > canvas.width - pacman.size) pacman.x = pacman.size;
    if (pacman.y < pacman.size) pacman.y = canvas.height - pacman.size;
    if (pacman.y > canvas.height - pacman.size) pacman.y = pacman.size;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPacman();
    update();
    requestAnimationFrame(gameLoop);
}

// Listen for arrow key presses
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            pacman.dx = 0;
            pacman.dy = -tileSize;
            break;
        case 'ArrowDown':
            pacman.dx = 0;
            pacman.dy = tileSize;
            break;
        case 'ArrowLeft':
            pacman.dx = -tileSize;
            pacman.dy = 0;
            break;
        case 'ArrowRight':
            pacman.dx = tileSize;
            pacman.dy = 0;
            break;
    }
});

gameLoop();