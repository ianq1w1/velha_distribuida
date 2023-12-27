const socket = io('http://10.35.5.74:8080');

document.addEventListener("DOMContentLoaded", function() {
    const boardElement = document.getElementById("board");
    const cells = [];
    let currentPlayer = "X";
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    let gameOver = false;
    let myTurn = true; // Adicione essa variável para controlar os turnos

    function createBoard() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener("click", handleCellClick);
                cells.push(cell);
                boardElement.appendChild(cell);
            }
        }
    }

    function handleCellClick(event) {
        if (gameOver || !myTurn) return;

        const clickedCell = event.target;
        const row = parseInt(clickedCell.dataset.row);
        const col = parseInt(clickedCell.dataset.col);
        const cellIndex = row * 3 + col;

        if (cells[cellIndex].textContent === "") {
            cells[cellIndex].textContent = currentPlayer;
            sendMoveToServer({ position: cellIndex }); // Enviar o movimento para o servidor
            myTurn = false; // Alterna o turno após o movimento
        }
    }

    function sendMoveToServer(moveData) {
        // Enviar o movimento para o servidor
        socket.emit('move', moveData);
    }

    // Receber movimentos do servidor e atualizar o jogo
    socket.on('move', (data) => {
        cells[data.position].textContent = data.symbol;
        checkWinner();
        myTurn = true; // É a vez do jogador após receber o movimento do oponente
    });

    function sendMoveToServer(moveData) {
        // Enviar o movimento para o servidor
        socket.emit('move', moveData);
    }

    // Receber movimentos do servidor e atualizar o jogo
    socket.on('move', (data) => {
        cells[data.position].textContent = data.symbol;
        checkWinner();
        currentPlayer = currentPlayer === "X" ? "O" : "X";
    });

    function checkWinner() {
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (
                cells[a].textContent !== "" &&
                cells[a].textContent === cells[b].textContent &&
                cells[a].textContent === cells[c].textContent
            ) {
                gameOver = true;
                highlightWinnerCells(cells[a], cells[b], cells[c]);
                setTimeout(() => {
                    alert(`O jogador ${cells[a].textContent} venceu!`);
                    resetBoard();
                }, 200);
                return;
            }
        }

        if (!cells.some(cell => cell.textContent === "")) {
            gameOver = true;
            setTimeout(() => {
                alert("Empate!");
                resetBoard();
            }, 200);
        }
    }

    function highlightWinnerCells(cellA, cellB, cellC) {
        cellA.style.backgroundColor = "lightgreen";
        cellB.style.backgroundColor = "lightgreen";
        cellC.style.backgroundColor = "lightgreen";
    }

    function resetBoard() {
        cells.forEach(cell => {
            cell.textContent = "";
            cell.style.backgroundColor = "";
        });
        currentPlayer = "X";
        gameOver = false;
    }

    createBoard();
});
