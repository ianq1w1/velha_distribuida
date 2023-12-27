
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// Armazena os IDs dos jogadores
let players = {};

app.get('/', function(req, res) {  
    res.sendFile(path.join(__dirname, './index.html'))
})

app.get('/velha.js', function(req, res) {  
    res.sendFile(path.join(__dirname, './velha.js'))
})
// Ao receber uma conexão de um cliente
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Adiciona o novo jogador à lista de jogadores
  players[socket.id] = {
    symbol: Object.keys(players).length === 0 ? 'X' : 'O', // Define 'X' para o primeiro jogador e 'O' para o segundo
  };

  // Envia a inicialização do jogo para o novo jogador
  socket.emit('init', { symbol: players[socket.id].symbol });

  // Ao receber um movimento do jogador
  socket.on('move', (data) => {
    // Reenvia o movimento para todos os jogadores
    io.sockets.emit('move', { symbol: players[socket.id].symbol, position: data.position });
  });

  // Ao desconectar um jogador
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    // Remove o jogador da lista de jogadores
    delete players[socket.id];
  });
});
const serverIP = '10.35.5.74'
const port = 8080
// Inicia o servidor na porta 8080
server.listen(port, serverIP, () => {
  console.log('Servidor rodando na porta 8080');
});
