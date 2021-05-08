const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime');
/*
import fs from 'fs';
import mime from 'mime'
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import http from 'http'
*/

const PORT = 4000;

const server = http.createServer();
server.on('request', (req, res) => {
  let filePath;
  if (req.url === '/') {
    filePath = 'index.html';
  } else {
    filePath = req.url.substr(1);
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('Not Found');
      } else {
        res.statusCode = 500;
        res.end('Error');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': mime.getType(filePath),
      });
      res.end(data);
    }
  });
});

const socket = new WebSocket.Server({ server });
socket.on('connection', (ws) => {
  ws.send(JSON.stringify({
    id: uuidv4(),
    type: 'set-id',
  }));
  ws.on('message', (data) => {
    socket.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

server.listen(PORT);
