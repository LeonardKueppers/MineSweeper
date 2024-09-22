const rows = 9;
const cols = 9;
const minesCount = 10;
let board = [];
let mineLocations = [];
let revealedCells = 0;
let score = 0;
let gameOver = false; // Variable, um das Ende des Spiels zu markieren
let timerInterval = null;
let timeElapsed = 0;
let firstClick = false; // Variable, um den ersten Klick zu erkennen

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
    gameStatusDiv.style.display = 'none'; // Verstecke den Spielstatus
    minesweeperDiv.style.pointerEvents = 'auto'; // Reaktiviere das Spielfeld
    minesweeperDiv.innerHTML = '';

    if (timerInterval) {
        clearInterval(timerInterval); // Setze den Timer zurück
    }

    // Setup grid
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-col', j);
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick); // Rechtsklick-Event hinzufügen
            minesweeperDiv.appendChild(cell);
        }
    }

    placeMines();
    updateNumbers();
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);

        if (board[row][col] !== 'M') {
            board[row][col] = 'M';
            mineLocations.push({ row, col });
            minesPlaced++;
        }
    }
}

function updateNumbers() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] === 'M') continue;
            board[i][j] = countMines(i, j);
        }
    }
}

function countMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (board[newRow][newCol] === 'M') {
                    count++;
                }
            }
        }
    }
    return count;
}

function handleCellClick(event) {
    if (gameOver) return; // Wenn das Spiel vorbei ist, ignoriere Klicks

    if (!firstClick) {
        startTimer();
        firstClick = true;
    }

    const row = parseInt(event.target.getAttribute('data-row'));
    const col = parseInt(event.target.getAttribute('data-col'));

    if (event.target.classList.contains('flag')) return; // Keine Aktion, wenn das Feld markiert ist

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
    event.preventDefault(); // Verhindert das Standard-Rechtsklick-Menü

    if (gameOver) return; // Wenn das Spiel vorbei ist, ignoriere Rechtsklicks

    const cell = event.target;
    if (cell.classList.contains('revealed')) return; // Keine Aktion, wenn die Zelle bereits aufgedeckt wurde

    if (cell.classList.contains('flag')) {
        cell.classList.remove('flag');
        cell.textContent = '';
    } else {
        cell.classList.add('flag');
        cell.textContent = '🚩'; // Flagge anzeigen
    }
}

function revealCell(row, col) {
    const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    if (cell.classList.contains('revealed') || cell.classList.contains('flag')) return;

    cell.classList.add('revealed');
    revealedCells++;

    const cellValue = board[row][col];
    if (cellValue > 0) {
        cell.textContent = cellValue;
        cell.setAttribute('data-value', cellValue); // Setze das data-value-Attribut für die Farben
    } else {
        revealAdjacentCells(row, col);
    }

    score++; // Punkte für das Aufdecken einer Zelle erhöhen
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
    minesweeperDiv.style.pointerEvents = 'none'; // Deaktiviere das Spielfeld nach Game Over
}

function showGameOverMessage() {
    gameStatusDiv.textContent = "GAME OVER!";
    gameStatusDiv.className = "game-over";
    gameStatusDiv.style.display = 'block'; // Zeige das "GAME OVER!"-Textfeld an
}

function showWinnerMessage() {
    gameStatusDiv.textContent = "WINNER!";
    gameStatusDiv.className = "winner";
    gameStatusDiv.style.display = 'block'; // Zeige das "WINNER!"-Textfeld an
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
