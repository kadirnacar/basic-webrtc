import express from 'express';
import ws from 'ws';

const app = express();
const wsServer = new ws.Server({ noServer: true });

wsServer.on('connection', (socket) => {
  socket.on('message', (message) => {
    console.log(message);
  });
});

const server = app.listen(3005);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit('connection', socket, request);
  });
});
