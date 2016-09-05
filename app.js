const http = require('http');
const express = require('express');
const SocketIO = require('socket.io');
const _ = require('lodash');

const clients = {};

const app = express();
app.use('/count', (req, res) => res.json({count: _.keys(clients).length}));
app.use('/broadcast/:message', (req, res) => {
   const { message } = req.params;

  _.each(clients, (c) => c.emit('message', {message}));

  res.json({message});
});

const server = http.createServer(app);

const ws = SocketIO(server);

ws.on('connection', (client) => {
  clients[client.id] = client;
  console.log('new connection', client.id);

  client.emit('message', { message: 'Welcome to my server' })

  client.on('disconnect', () => {
    delete clients[client.id];
    console.log(`Client: ${client} Disconnect`);
  });
});

server.listen(3000);
