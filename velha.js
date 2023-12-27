const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentPlayer = 'X'; // Inicializa com o jogador 'X' (jogador 1)
let gameBoard = Array(9).fill(''); // Tabuleiro do jogo

// Armazena o ID do jogador atualmente em turno
let currentPlayerSocket = null;

app.get('/', function(req, res) {  
    res.sendFile(path.join(__dirname, './index.html'))
})

app.get('/velha.js', function(req, res) {  
    res.sendFile(path.join(__dirname, './velha.js'))
})

io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.emit('currentPlayer', currentPlayer); // Envio do jogador atual para o cliente

    socket.on('move', (data) => {
        if (currentPlayerSocket === socket && currentPlayer === 'X') {
            if (gameBoard[data.position] === '') {
                gameBoard[data.position] = 'X'; // Registra a jogada do jogador X no tabuleiro
                io.sockets.emit('move', { symbol: 'X', position: data.position }); // Envia o movimento para os clientes
                if (checkWinner('X')) {
                    io.sockets.emit('gameOver', { winner: 'X' }); // Envia o evento de fim do jogo com o vencedor 'X'
                } else if (!gameBoard.some(cell => cell === '')) {
                    io.sockets.emit('gameOver', { winner: 'Draw' }); // Envia o evento de fim do jogo com empate
                } else {
                    currentPlayer = 'O'; // Muda para o jogador 'O'
                    currentPlayerSocket = null;
                    io.sockets.emit('currentPlayer', currentPlayer); // Envia o novo jogador atual para os clientes
                }
            }
        } else if (currentPlayerSocket === socket && currentPlayer === 'O') {
            if (gameBoard[data.position] === '') {
                gameBoard[data.position] = 'O'; // Registra a jogada do jogador O no tabuleiro
                io.sockets.emit('move', { symbol: 'O', position: data.position }); // Envia o movimento para os clientes
                if (checkWinner('O')) {
                    io.sockets.emit('gameOver', { winner: 'O' }); // Envia o evento de fim do jogo com o vencedor 'O'
                } else if (!gameBoard.some(cell => cell === '')) {
                    io.sockets.emit('gameOver', { winner: 'Draw' }); // Envia o evento de fim do jogo com empate
                } else {
                    currentPlayer = 'X'; // Muda para o jogador 'X'
                    currentPlayerSocket = null;
                    io.sockets.emit('currentPlayer', currentPlayer); // Envia o novo jogador atual para os clientes
                }
            }
        }
    });

    function checkWinner(symbol) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
    
        return winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return gameBoard[a] === symbol && gameBoard[b] === symbol && gameBoard[c] === symbol;
        })
    }

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
        if (socket === currentPlayerSocket) {
            currentPlayerSocket = null;
        }
    });

    socket.on('join', () => {
        // Define o primeiro jogador como 'X' quando um novo jogador se junta
        if (currentPlayerSocket === null) {
            currentPlayerSocket = socket;
            currentPlayer = 'X'; // O primeiro jogador será sempre 'X'
            socket.emit('currentPlayer', currentPlayer);
        }
    });
});

const serverIP = '10.35.5.74';
const port = 8080;
server.listen(port, serverIP, () => {
    console.log('Servidor rodando na porta 8080');
});
