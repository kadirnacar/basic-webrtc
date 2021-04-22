import express from 'express';
import * as http from 'http';
import ws from 'ws';

const server = http.createServer(express);
const wsServer = new ws.Server({ server });

wsServer.on('connection', (socket: ws, request: http.IncomingMessage) => {
  socket.on('message', (message: ws.Data) => {
    console.log(message);
  });
});

server.listen(3005);
