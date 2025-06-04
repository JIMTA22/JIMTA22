const gameContainer = document.getElementById('game');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restart');

let board = Array(9).fill(null);
let currentPlayer = '❌';
let gameActive = true;

function createBoard() {
    gameContainer.innerHTML = '';
    board.forEach((_, index) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = index;
        cell.addEventListener('click', handleCellClick);
        gameContainer.appendChild(cell);
    });
}

function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (!gameActive || board[index]) return;
    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.style.transform = 'scale(1.2)';
    setTimeout(() => e.target.style.transform = 'scale(1)', 150);
    if (checkWin()) {
        statusDiv.textContent = `¡${currentPlayer} gana!`;
        gameActive = false;
    } else if (board.every(Boolean)) {
        statusDiv.textContent = '¡Empate!';
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === '❌' ? '⭕' : '❌';
        statusDiv.textContent = `Turno de ${currentPlayer}`;
    }
}

function checkWin() {
    const winningCombos = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return winningCombos.some(combo => {
        const [a,b,c] = combo;
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

restartBtn.addEventListener('click', () => {
    board.fill(null);
    currentPlayer = '❌';
    gameActive = true;
    statusDiv.textContent = 'Turno de ❌';
    createBoard();
});

// Initialize
statusDiv.textContent = 'Turno de ❌';
createBoard();
