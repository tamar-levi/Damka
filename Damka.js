const board = document.getElementById('board');
const rows = 8;
const cols = 8;
let selectedPiece = null;
let currentPlayer = 'player1'; // משתנה שמנהל את תור השחקן הנוכחי

// יצירת הלוח והצבת החיילים
function createBoard() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', (row + col) % 2 === 0 ? 'white' : 'black');
            cell.dataset.row = row;
            cell.dataset.col = col;

            // הצבת חיילים בשורות העליונות והתחתונות
            if (row < 3 && (row + col) % 2 !== 0) {
                const piece = document.createElement('div');
                piece.classList.add('piece', 'player2');
                piece.dataset.player = 'player2';
                cell.appendChild(piece);
            } else if (row > 4 && (row + col) % 2 !== 0) {
                const piece = document.createElement('div');
                piece.classList.add('piece', 'player1');
                piece.dataset.player = 'player1';
                cell.appendChild(piece);
            }

            cell.addEventListener('click', () => handleCellClick(cell));
            board.appendChild(cell);
        }
    }
}

// טיפול בלחיצה על תא
function handleCellClick(cell) {
    const piece = cell.querySelector('.piece');
    const hasMandatoryCapture = mustCapture();

    // בדיקת אפשרות לאכילה חובה והגבלת תנועת החיילים בהתאם
    if (piece && piece.dataset.player === currentPlayer && !selectedPiece) {
        if (!hasMandatoryCapture || (hasMandatoryCapture && canPieceCapture(piece))) {
            selectedPiece = piece;
            highlightAvailableMoves(cell, hasMandatoryCapture);
        }
    } else if (selectedPiece && cell.classList.contains('highlight')) {
        movePiece(cell);
        clearHighlights();
        selectedPiece = null;
        togglePlayer(); // מעבר לשחקן הבא
    } else {
        clearHighlights();
        selectedPiece = null;
    }
}

// בדיקה אם יש אפשרות חובה לאכול חייל יריב
function mustCapture() {
    let mustCapture = false;
    document.querySelectorAll(`.piece.${currentPlayer}`).forEach(piece => {
        if (canPieceCapture(piece)) {
            mustCapture = true;
        }
    });
    return mustCapture;
}

// בדיקה אם חייל מסוים יכול לאכול חייל יריב
function canPieceCapture(piece) {
    const cell = piece.parentElement;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const directions = piece.classList.contains('king') ? [-1, 1] : [currentPlayer === 'player1' ? -1 : 1];

    return directions.some(direction => {
        const potentialMoves = [
            { row: row + direction, col: col - 1, jumpRow: row + 2 * direction, jumpCol: col - 2 },
            { row: row + direction, col: col + 1, jumpRow: row + 2 * direction, jumpCol: col + 2 }
        ];

        return potentialMoves.some(move => {
            const targetCell = document.querySelector(`.cell[data-row='${move.row}'][data-col='${move.col}']`);
            if (targetCell && targetCell.querySelector('.piece') && targetCell.querySelector('.piece').dataset.player !== currentPlayer) {
                const jumpCell = document.querySelector(`.cell[data-row='${move.jumpRow}'][data-col='${move.jumpCol}']`);
                return jumpCell && !jumpCell.querySelector('.piece');
            }
            return false;
        });
    });
}

// הדגשת תאים זמינים להזזה או דילוג
function highlightAvailableMoves(cell, hasMandatoryCapture) {
    clearHighlights();
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const directions = selectedPiece.classList.contains('king') ? [-1, 1] : [currentPlayer === 'player1' ? -1 : 1];

    directions.forEach(direction => {
        const potentialMoves = [
            { row: row + direction, col: col - 1, jumpRow: row + 2 * direction, jumpCol: col - 2 },
            { row: row + direction, col: col + 1, jumpRow: row + 2 * direction, jumpCol: col + 2 }
        ];

        potentialMoves.forEach(move => {
            const targetCell = document.querySelector(`.cell[data-row='${move.row}'][data-col='${move.col}']`);
            if (targetCell && !targetCell.querySelector('.piece') && !hasMandatoryCapture) {
                targetCell.classList.add('highlight');
            } else if (targetCell && targetCell.querySelector('.piece') && targetCell.querySelector('.piece').dataset.player !== currentPlayer) {
                const jumpCell = document.querySelector(`.cell[data-row='${move.jumpRow}'][data-col='${move.jumpCol}']`);
                if (jumpCell && !jumpCell.querySelector('.piece')) {
                    jumpCell.classList.add('highlight');
                    jumpCell.dataset.jump = `${move.row},${move.col}`;
                }
            }
        });
    });
}

// הזזת החייל לתא נבחר והסרת חייל יריב במקרה של דילוג
function movePiece(targetCell) {
    if (targetCell.dataset.jump) {
        const [jumpRow, jumpCol] = targetCell.dataset.jump.split(',').map(Number);
        const jumpedCell = document.querySelector(`.cell[data-row='${jumpRow}'][data-col='${jumpCol}']`);
        jumpedCell.querySelector('.piece').remove();
        delete targetCell.dataset.jump;
    }
    targetCell.appendChild(selectedPiece);
    checkPromotion(targetCell);
}

// בדיקה אם החייל צריך להפוך ל"מלך"
function checkPromotion(cell) {
    const row = parseInt(cell.dataset.row);
    if ((currentPlayer === 'player1' && row === 0) || (currentPlayer === 'player2' && row === 7)) {
        selectedPiece.classList.add('king');
    }
}

// איפוס הדגשת התאים
function clearHighlights() {
    document.querySelectorAll('.cell.highlight').forEach(cell => {
        cell.classList.remove('highlight');
        delete cell.dataset.jump;
    });
}

// מעבר לשחקן הבא
function togglePlayer() {
    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
}

// הפעלת הפונקציה ליצירת הלוח
createBoard();
