const http = require('http')  ;
const SocketIO = require('socket.io');

const server = http.createServer();
const ws = SocketIO(server);

ws.on('connection', (client) => {
  console.log('new connection');

  client.emit('aaa', { message: 'cool message' })

  client.on('event', (data) => console.log(`Client: ${client} Event: ${data}`));

  client.on('disconnect', () => console.log(`Client: ${client} Disconnect`));
});

server.listen(3000);
