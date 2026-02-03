const gameContainer = document.getElementById('game');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause');
const scoreSpan = document.getElementById('score');
const dpadButtons = document.querySelectorAll('.dpad-btn');

const gridSize = 16;
const tickRate = 140;

const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

let cells = [];
let state = createInitialState();
let loopId = null;

function createInitialState() {
    const snake = [
        { x: 8, y: 8 },
        { x: 7, y: 8 },
        { x: 6, y: 8 }
    ];
    return {
        snake,
        direction: directions.right,
        nextDirection: directions.right,
        food: placeFood(snake),
        score: 0,
        paused: true,
        gameOver: false
    };
}

function initGrid() {
    gameContainer.innerHTML = '';
    cells = [];
    for (let y = 0; y < gridSize; y += 1) {
        for (let x = 0; x < gridSize; x += 1) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            gameContainer.appendChild(cell);
            cells.push(cell);
        }
    }
}

function getCellIndex(position) {
    return position.y * gridSize + position.x;
}

function isSamePosition(a, b) {
    return a.x === b.x && a.y === b.y;
}

function isOppositeDirection(dirA, dirB) {
    return dirA.x + dirB.x === 0 && dirA.y + dirB.y === 0;
}

function placeFood(snake) {
    const emptyCells = [];
    for (let y = 0; y < gridSize; y += 1) {
        for (let x = 0; x < gridSize; x += 1) {
            const occupied = snake.some(segment => segment.x === x && segment.y === y);
            if (!occupied) {
                emptyCells.push({ x, y });
            }
        }
    }
    if (emptyCells.length === 0) {
        return null;
    }
    const choice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return { ...choice };
}

function advanceState(currentState) {
    const head = currentState.snake[0];
    const nextHead = {
        x: head.x + currentState.nextDirection.x,
        y: head.y + currentState.nextDirection.y
    };

    const hitWall = nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= gridSize || nextHead.y >= gridSize;
    const hitSelf = currentState.snake.some(segment => isSamePosition(segment, nextHead));

    if (hitWall || hitSelf) {
        return { ...currentState, gameOver: true, paused: true };
    }

    const ateFood = currentState.food && isSamePosition(nextHead, currentState.food);
    const newSnake = [nextHead, ...currentState.snake];
    if (!ateFood) {
        newSnake.pop();
    }

    return {
        ...currentState,
        snake: newSnake,
        direction: currentState.nextDirection,
        food: ateFood ? placeFood(newSnake) : currentState.food,
        score: ateFood ? currentState.score + 1 : currentState.score
    };
}

function render() {
    cells.forEach(cell => {
        cell.classList.remove('snake', 'head', 'food');
    });

    const [head, ...tail] = state.snake;
    if (head) {
        const headCell = cells[getCellIndex(head)];
        if (headCell) {
            headCell.classList.add('snake', 'head');
        }
    }
    tail.forEach(segment => {
        const cell = cells[getCellIndex(segment)];
        if (cell) {
            cell.classList.add('snake');
        }
    });
    if (state.food) {
        const foodCell = cells[getCellIndex(state.food)];
        if (foodCell) {
            foodCell.classList.add('food');
        }
    }

    scoreSpan.textContent = state.score;
    if (state.gameOver) {
        statusDiv.textContent = 'Game Over. Presiona Reiniciar.';
    } else if (state.paused) {
        statusDiv.textContent = 'Pausado. Presiona una tecla para jugar.';
    } else {
        statusDiv.textContent = '¡En juego!';
    }
}

function startLoop() {
    if (loopId) {
        clearInterval(loopId);
    }
    loopId = setInterval(() => {
        if (!state.paused && !state.gameOver) {
            state = advanceState(state);
            render();
        }
    }, tickRate);
}

function setDirection(newDirection) {
    if (state.gameOver) {
        return;
    }
    if (!isOppositeDirection(state.direction, newDirection)) {
        state.nextDirection = newDirection;
    }
    if (state.paused) {
        state.paused = false;
    }
    render();
}

function handleKey(event) {
    const key = event.key.toLowerCase();
    if (key === ' ') {
        togglePause();
        return;
    }
    if (key === 'arrowup' || key === 'w') {
        setDirection(directions.up);
    } else if (key === 'arrowdown' || key === 's') {
        setDirection(directions.down);
    } else if (key === 'arrowleft' || key === 'a') {
        setDirection(directions.left);
    } else if (key === 'arrowright' || key === 'd') {
        setDirection(directions.right);
    }
}

function resetGame() {
    state = createInitialState();
    render();
}

function togglePause() {
    if (state.gameOver) {
        return;
    }
    state.paused = !state.paused;
    render();
}

restartBtn.addEventListener('click', resetGame);
pauseBtn.addEventListener('click', togglePause);
window.addEventListener('keydown', handleKey);
dpadButtons.forEach(button => {
    button.addEventListener('click', () => {
        const dir = button.dataset.dir;
        setDirection(directions[dir]);
    });
});

initGrid();
startLoop();
render();
