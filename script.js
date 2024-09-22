const rows = 9;
const cols = 9;
const minesCount = 10;
let board = [];
let mineLocations = [];
let revealedCells = 0;
let score = 0;
let gameOver = false;
let timerInterval = null;
let timeElapsed = 0;
let firstClick = false;

const minesweeperDiv = document.getElementById('minesweeper');
const scoreSpan = document.getElementById('score');
const timeSpan = document.getElementById('time');
const gameStatusDiv = document.getElementById('game-status');

function initGame() {
    board = Array(rows).fill().map(() => Array(cols).fill(0));
    mineLocations = [];
    revealedCells = 0;
    score = 0;
    timeElapsed = 0;
    firstClick = false;
    gameOver = false;
    updateScore();
    updateTime();
    gameStatusDiv.style.display = 'none';
    minesweeperDiv.style.pointerEvents = 'auto';
    minesweeperDiv.innerHTML = '';

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-col', j);
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);

            // Mobile: Long press für Fahnen + Verhindern von Standardmarkierung
            cell.addEventListener('touchstart', handleLongPressStart, { passive: false });
            cell.addEventListener('touchend', handleLongPressEnd);
            cell.addEventListener('touchmove', (e) => e.preventDefault()); // Verhindert das Markieren

            minesweeperDiv.appendChild(cell);
        }
    }

    placeMines();
    updateNumbers();
}

function handleCellClick(event) {
    if (gameOver) return;

    const row = parseInt(event.target.getAttribute('data-row'));
    const col = parseInt(event.target.getAttribute('data-col'));

    if (event.target.classList.contains('flag')) return;

    if (board[row][col] === 'M') {
        revealMines();
        gameOver = true;
        showGameOverMessage();
        stopTimer();
        return;
    }

    revealCell(row, col);
    updateScore();

    if (revealedCells === rows * cols - minesCount) {
        showWinnerMessage();
        revealMines();
        gameOver = true;
        stopTimer();
    }
}

function handleRightClick(event) {
    event.preventDefault();
    if (gameOver) return;

    const cell = event.target;
    if (cell.classList.contains('revealed')) return;

    if (cell.classList.contains('flag')) {
        cell.classList.remove('flag');
        cell.textContent = '';
    } else {
        cell.classList.add('flag');
        cell.textContent = '🚩';
    }
}

// Mobile: Long press für Fahnen
let pressTimer;
function handleLongPressStart(event) {
    event.preventDefault(); // Verhindert das Standardverhalten auf Mobilgeräten
    pressTimer = setTimeout(() => {
        handleRightClick(event);
    }, 500);
}

function handleLongPressEnd() {
    clearTimeout(pressTimer);
}

function revealCell(row, col) {
    const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (cell.classList.contains('revealed') || cell.classList.contains('flag')) return;

    cell.classList.add('revealed');
    revealedCells++;

    const cellValue = board[row][col];
    if (cellValue > 0) {
        cell.textContent = cellValue;
        cell.setAttribute('data-value', cellValue);
    } else {
        revealAdjacentCells(row, col);
    }

    score++;
}

function revealAdjacentCells(row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                revealCell(newRow, newCol);
            }
        }
    }
}

function revealMines() {
    mineLocations.forEach(({ row, col }) => {
        const mineCell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
        mineCell.classList.add('mine');
        mineCell.textContent = '💣';
    });
    minesweeperDiv.style.pointerEvents = 'none';
}

function showGameOverMessage() {
    gameStatusDiv.textContent = "GAME OVER!";
    gameStatusDiv.className = "game-over";
    gameStatusDiv.style.display = 'block';
}

function showWinnerMessage() {
    gameStatusDiv.textContent = "WINNER!";
    gameStatusDiv.className = "winner";
    gameStatusDiv.style.display = 'block';
}

function updateScore() {
    scoreSpan.textContent = score;
}

function restartGame() {
    initGame();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        updateTime();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTime() {
    timeSpan.textContent = timeElapsed;
}

function toggleInfo() {
    const infoBox = document.getElementById('info-box');
    if (infoBox.style.display === 'none') {
        infoBox.style.display = 'block';
        document.getElementById('info-button').textContent = 'Spielregeln verbergen';
    } else {
        infoBox.style.display = 'none';
        document.getElementById('info-button').textContent = 'Spielregeln anzeigen';
    }
}

initGame();
