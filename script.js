const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const TILE = 20;
const COLS = 28;
const ROWS = 31;
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

/* map legend: 0=path, 1=wall, 2=dot, 3=pill, 4=ghost house, 5=ghost door */
const MAP_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const DOT_SCORE = 10;
const PILL_SCORE = 50;
const GHOST_SCORE = [200, 400, 800, 1600];
const FRIGHT_DURATION = 360; // frames (~6s at 60fps)
const SCATTER_DURATION = 420;
const CHASE_DURATION = 480;
const GHOST_SPEED_NORMAL = 0.8;
const GHOST_SPEED_FRIGHT = 0.5;
const GHOST_SPEED_TUNNEL = 0.4;
const PAC_SPEED = 0.6;
const FRAME_INTERVAL = 16; // ~60fps

/* ---- State ---- */
let map = [];
let score, lives, level;
let dotsLeft, totalDots;
let pacman, ghosts;
let gameState; // 'ready','playing','dying','dead','win'
let frightTimer = 0;
let modeTimer = 0;
let ghostMode = 'scatter'; // 'scatter'|'chase'
let modeIndex = 0;
const MODE_TIMES = [SCATTER_DURATION, CHASE_DURATION];

let nextDir = { x: 0, y: 0 };
let animFrame = 0;
let lastTime = 0;
let accumulator = 0;
let running = false;

/* ---- Utility ---- */
function cloneMap() { return MAP_TEMPLATE.map(r => [...r]); }

function countDots(m) {
    let c = 0;
    for (let r of m) for (let v of r) if (v === 2 || v === 3) c++;
    return c;
}

function canMove(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    const v = map[y][x];
    return v !== 1 && v !== 4;
}

/* ---- Pacman ---- */
function createPacman() {
    return { x: 14, y: 23, px: 14 * TILE, py: 23 * TILE, dir: { x: 0, y: 0 }, mouth: 0 };
}

/* ---- Ghosts ---- */
function createGhost(name, startX, startY, color, scatterTarget, mode) {
    return {
        name, x: startX, y: startY,
        px: startX * TILE, py: startY * TILE,
        color, scatterTarget,
        target: { x: startX, y: startY },
        dir: { x: -1, y: 0 },
        mode: mode || 'inhouse', // 'inhouse','leaving','scatter','chase','fright','eaten'
        frightened: false,
        eaten: false,
        speed: GHOST_SPEED_NORMAL,
        inHouse: true,
        releaseTimer: 0
    };
}

/* ---- Init ---- */
function init() {
    map = cloneMap();
    score = 0;
    lives = 3;
    level = 1;
    totalDots = countDots(map);
    dotsLeft = totalDots;
    gameState = 'ready';
    frightTimer = 0;
    modeTimer = 0;
    ghostMode = 'scatter';
    modeIndex = 0;
    nextDir = { x: 0, y: 0 };
    pacman = createPacman();

    ghosts = [
        createGhost('blinky', 14, 11, '#FF0000', { x: 25, y: 0 }, 'chase'),
        createGhost('pinky', 14, 14, '#FFB8FF', { x: 2, y: 0 }, 'chase'),
        createGhost('inky', 12, 14, '#00FFFF', { x: 27, y: 30 }, 'chase'),
        createGhost('clyde', 16, 14, '#FFB852', { x: 0, y: 30 }, 'chase')
    ];
    // blinky starts out
    ghosts[0].mode = 'chase';
    ghosts[0].inHouse = false;
    ghosts[1].releaseTimer = 60;
    ghosts[2].releaseTimer = 150;
    ghosts[3].releaseTimer = 300;
    ghostMode = 'chase'; // immediate chase
}

/* ---- Ghost AI ---- */
function getGhostTarget(ghost) {
    if (ghost.mode === 'eaten') return { x: 14, y: 11 };
    if (ghost.mode === 'fright') return null; // random
    if (ghost.name === 'blinky') return { x: pacman.x, y: pacman.y };
    if (ghost.name === 'pinky') {
        let tx = pacman.x + pacman.dir.x * 4;
        let ty = pacman.y + pacman.dir.y * 4;
        return { x: tx, y: ty };
    }
    if (ghost.name === 'inky') {
        let a = { x: pacman.x + pacman.dir.x * 2, y: pacman.y + pacman.dir.y * 2 };
        let b = ghosts[0];
        return { x: a.x + (a.x - b.x), y: a.y + (a.y - b.y) };
    }
    if (ghost.name === 'clyde') {
        let dist = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
        if (dist > 8) return { x: pacman.x, y: pacman.y };
        return ghost.scatterTarget;
    }
    return ghost.scatterTarget;
}

function chooseDirection(ghost) {
    const dirs = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }];
    const reverseDir = { x: -ghost.dir.x, y: -ghost.dir.y };
    const target = ghost.mode === 'fright' ? null : getGhostTarget(ghost);
    let best = null, bestDist = Infinity;
    const choices = dirs.filter(d => {
        if (d.x === reverseDir.x && d.y === reverseDir.y) return false;
        let nx = ghost.x + d.x, ny = ghost.y + d.y;
        // tunnel wrap
        if (nx < 0 || nx >= COLS) return true;
        return canMove(nx, ny);
    });
    // if only reverse is valid
    if (choices.length === 0) return reverseDir;
    if (ghost.mode === 'fright') {
        return choices[Math.floor(Math.random() * choices.length)];
    }
    for (let d of choices) {
        let nx = ghost.x + d.x, ny = ghost.y + d.y;
        nx = ((nx % COLS) + COLS) % COLS;
        ny = Math.max(0, Math.min(ROWS - 1, ny));
        let dist = Math.hypot(nx - target.x, ny - target.y);
        if (dist < bestDist) { bestDist = dist; best = d; }
    }
    return best || reverseDir;
}

/* ---- Update ---- */
function update() {
    if (gameState === 'dying') return;
    if (gameState !== 'playing') return;

    // mode timer
    modeTimer++;
    let duration = ghostMode === 'scatter' ? MODE_TIMES[0] : MODE_TIMES[1];
    if (modeTimer >= duration) {
        ghostMode = ghostMode === 'scatter' ? 'chase' : 'scatter';
        modeTimer = 0;
        // reverse all ghost directions
        for (let g of ghosts) {
            if (!g.inHouse && g.mode !== 'eaten') {
                g.dir = { x: -g.dir.x, y: -g.dir.y };
            }
        }
    }

    // fright timer
    if (frightTimer > 0) {
        frightTimer--;
        if (frightTimer === 0) {
            for (let g of ghosts) {
                if (g.mode === 'fright') g.mode = ghostMode;
            }
        }
    }

    // release ghosts
    for (let g of ghosts) {
        if (g.inHouse) {
            g.releaseTimer--;
            if (g.releaseTimer <= 0) {
                g.inHouse = false;
                g.mode = ghostMode;
                g.px = 14 * TILE;
                g.py = 11 * TILE;
                g.x = 14; g.y = 11;
                g.dir = { x: -1, y: 0 };
            }
        }
    }

    // move pacman
    let pdir = { ...nextDir };
    let nx = pacman.x + pdir.x, ny = pacman.y + pdir.y;
    // tunnel wrap
    if (nx < 0) nx = COLS - 1;
    if (nx >= COLS) nx = 0;
    if (canMove(nx, ny)) {
        pacman.dir = pdir;
        pacman.x = nx; pacman.y = ny;
    } else {
        // try current direction
        nx = pacman.x + pacman.dir.x; ny = pacman.y + pacman.dir.y;
        if (nx < 0) nx = COLS - 1;
        if (nx >= COLS) nx = 0;
        if (canMove(nx, ny)) { pacman.x = nx; pacman.y = ny; }
    }
    pacman.px = pacman.x * TILE;
    pacman.py = pacman.y * TILE;

    // eat dot/pill
    const cell = map[pacman.y][pacman.x];
    if (cell === 2) { score += DOT_SCORE; dotsLeft--; map[pacman.y][pacman.x] = 0; }
    if (cell === 3) {
        score += PILL_SCORE;
        dotsLeft--;
        map[pacman.y][pacman.x] = 0;
        frightTimer = FRIGHT_DURATION;
        for (let g of ghosts) {
            if (!g.inHouse && g.mode !== 'eaten') {
                g.mode = 'fright';
                g.dir = { x: -g.dir.x, y: -g.dir.y };
            }
        }
    }
    if (dotsLeft <= 0) { gameState = 'win'; overlay.classList.remove('hidden'); return; }

    // move ghosts
    let eatenCount = 0;
    for (let g of ghosts) {
        if (g.inHouse) continue;
        // use interval-based movement (slower than pacman)
        g.speed = g.mode === 'fright' ? GHOST_SPEED_FRIGHT : GHOST_SPEED_NORMAL;
        // tunnel slow
        if (g.x < 0 || g.x >= COLS) g.speed = GHOST_SPEED_TUNNEL;
        // move ghost every other frame for simplicity
        // we'll move all ghosts every frame but with fractional tile

        // Choose new direction at tile center
        if (Math.abs(g.px - g.x * TILE) < 2 && Math.abs(g.py - g.y * TILE) < 2) {
            let newDir = chooseDirection(g);
            g.dir = newDir;
        }
        g.px += g.dir.x * g.speed;
        g.py += g.dir.y * g.speed;
        g.x = Math.round(g.px / TILE);
        g.y = Math.round(g.py / TILE);
        // tunnel wrap
        if (g.px < -TILE) g.px = canvas.width;
        if (g.px > canvas.width) g.px = -TILE;
        g.x = Math.round(g.px / TILE);

        // eaten ghost returns
        if (g.mode === 'eaten' && Math.abs(g.px - 14 * TILE) < 4 && Math.abs(g.py - 11 * TILE) < 4) {
            g.mode = ghostMode;
            g.inHouse = true;
            g.releaseTimer = 30;
            g.x = 14; g.y = 14;
            g.px = 14 * TILE; g.py = 14 * TILE;
        }

        // collision
        if (g.mode !== 'eaten' && Math.abs(g.px - pacman.px) < TILE * 0.8 && Math.abs(g.py - pacman.py) < TILE * 0.8) {
            if (g.mode === 'fright') {
                g.mode = 'eaten';
                score += GHOST_SCORE[Math.min(eatenCount, 3)];
                eatenCount++;
            } else {
                die();
                return;
            }
        }
    }
}

function die() {
    gameState = 'dying';
    lives--;
    setTimeout(() => {
        if (lives <= 0) {
            gameState = 'dead';
            document.querySelector('#overlay .title').textContent = 'GAME OVER';
            document.querySelector('#overlay p').textContent = `Score: ${score}`;
            overlay.classList.remove('hidden');
        } else {
            // reset positions
            pacman = createPacman();
            nextDir = { x: 0, y: 0 };
            ghosts.forEach((g, i) => {
                const starts = [[14,11],[14,14],[12,14],[16,14]];
                g.x = starts[i][0]; g.y = starts[i][1];
                g.px = starts[i][0]*TILE; g.py = starts[i][1]*TILE;
                g.dir = { x: -1, y: 0 };
                g.inHouse = i !== 0;
                g.mode = i === 0 ? ghostMode : 'inhouse';
                g.eaten = false;
                g.releaseTimer = i === 0 ? 0 : [0, 60, 150, 300][i];
            });
            gameState = 'playing';
        }
    }, 1000);
}

/* ---- Draw ---- */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const v = map[y][x];
            if (v === 1) {
                ctx.fillStyle = '#2121DE';
                ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
            } else if (v === 2) {
                ctx.fillStyle = '#FFB8AE';
                ctx.beginPath();
                ctx.arc(x * TILE + TILE/2, y * TILE + TILE/2, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (v === 3) {
                ctx.fillStyle = '#FFB8AE';
                ctx.beginPath();
                ctx.arc(x * TILE + TILE/2, y * TILE + TILE/2, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Draw ghosts
    for (let g of ghosts) {
        if (g.inHouse && g.mode === 'inhouse') continue;
        const cx = g.px, cy = g.py;
        let color;
        if (g.mode === 'eaten') { /* draw nothing - draw just eyes */ }
        else if (g.mode === 'fright') color = frightTimer < 120 && Math.floor(frightTimer / 10) % 2 === 0 ? '#FFF' : '#2121DE';
        else color = g.color;

        if (g.mode !== 'eaten') {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx + TILE/2, cy + TILE/2 - 2, TILE/2 - 1, Math.PI, 0);
            ctx.lineTo(cx + TILE - 1, cy + TILE - 1);
            ctx.lineTo(cx + 1, cy + TILE - 1);
            ctx.closePath();
            ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx + 6, cy + 7, 3, 0, Math.PI*2);
        ctx.arc(cx + 14, cy + 7, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#2121DE';
        ctx.beginPath();
        ctx.arc(cx + 6 + g.dir.x*2, cy + 7 + g.dir.y*2, 1.5, 0, Math.PI*2);
        ctx.arc(cx + 14 + g.dir.x*2, cy + 7 + g.dir.y*2, 1.5, 0, Math.PI*2);
        ctx.fill();
    }

    // Draw pacman
    const pmx = pacman.px + TILE/2, pmy = pacman.py + TILE/2;
    const mouthOpen = 0.2 + 0.15 * Math.sin(animFrame * 0.3);
    const angle = pacman.dir.x === 1 ? 0 : pacman.dir.x === -1 ? Math.PI : pacman.dir.y === -1 ? Math.PI * 3/2 : Math.PI / 2;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(pmx, pmy, TILE/2 - 1, angle + mouthOpen, angle + Math.PI * 2 - mouthOpen);
    ctx.lineTo(pmx, pmy);
    ctx.closePath();
    ctx.fill();

    // UI
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.fillText(`SCORE: ${score}`, 10, canvas.height - 8);
    ctx.fillText(`LIVES: ${'♥'.repeat(lives)}`, canvas.width / 2 - 40, canvas.height - 8);
    ctx.fillText(`LEVEL ${level}`, canvas.width - 100, canvas.height - 8);
}

/* ---- Game Loop ---- */
function gameLoop(timestamp) {
    if (!running) return;
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    accumulator += delta;

    while (accumulator >= FRAME_INTERVAL) {
        update();
        accumulator -= FRAME_INTERVAL;
    }
    animFrame++;
    draw();
    requestAnimationFrame(gameLoop);
}

/* ---- Start ---- */
function startGame() {
    overlay.classList.add('hidden');
    init();
    gameState = 'playing';
    running = true;
    lastTime = 0;
    accumulator = 0;
    animFrame = 0;
    requestAnimationFrame(gameLoop);
}

/* ---- Input ---- */
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && (gameState === 'ready' || gameState === 'dead' || gameState === 'win')) {
        e.preventDefault();
        startGame();
        return;
    }
    if (gameState !== 'playing') return;
    switch (e.key) {
        case 'ArrowUp': nextDir = { x: 0, y: -1 }; e.preventDefault(); break;
        case 'ArrowDown': nextDir = { x: 0, y: 1 }; e.preventDefault(); break;
        case 'ArrowLeft': nextDir = { x: -1, y: 0 }; e.preventDefault(); break;
        case 'ArrowRight': nextDir = { x: 1, y: 0 }; e.preventDefault(); break;
    }
});

// Touch controls for mobile
(function() {
    let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchStartTime = Date.now();
    });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const t = Date.now() - touchStartTime;
        if (t > 500) return;
        const adx = Math.abs(dx), ady = Math.abs(dy);
        if (adx < 10 && ady < 10) {
            if (gameState === 'ready' || gameState === 'dead' || gameState === 'win') {
                startGame();
            }
            return;
        }
        if (adx > ady) {
            nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }
    });
})();

startBtn.addEventListener('click', startGame);

/* ---- Bootstrap: show ready state ---- */
init();
overlay.classList.remove('hidden');
document.querySelector('#overlay .title').textContent = 'PAC-MAN';
document.querySelector('#overlay p').textContent = 'Press SPACE to start';