import express from 'express';
import * as http from 'http';
import ws from 'ws';

const server = http.createServer(express);
const wsServer = new ws.Server({ server });

const clients: { [key: string]: ws } = {};
const streamers: { [key: string]: ws } = {};
const allClients: ws[] = [];

wsServer.on('connection', (socket: ws, request: http.IncomingMessage) => {
  const id = request.url.split('/')[1];

  if (id) {
    if (request.url.endsWith('client')) {
      clients[id] = socket;
    } else {
      streamers[id] = socket;
      allClients.forEach((x) => x.send(JSON.stringify({ type: 'streamers', streamers: Object.keys(streamers) })));
    }
  }

  allClients.push(socket);

  socket.onmessage = (message: ws.MessageEvent) => {
    const msg = JSON.parse(message.data.toString());
    try {
      if (msg) {
        if (msg.type == 'getStreamers') {
          socket.send(JSON.stringify({ type: 'streamers', streamers: Object.keys(streamers) }));
        } else if (msg.streamerId) {
          streamers[msg.streamerId].send(JSON.stringify({ playerId: id, ...msg, streamerId: null }));
        } else if (msg.playerId) {
          clients[msg.playerId].send(JSON.stringify({ streamerId: id, ...msg, playerId: null }));
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  };

  socket.on('close', (code, reason) => {
    delete clients[id];
    if (streamers[id]) {
      delete streamers[id];
      allClients.forEach((x) => x.send(JSON.stringify({ type: 'streamers', streamers: Object.keys(streamers) })));
    }
  });
});

server.listen(3005);
