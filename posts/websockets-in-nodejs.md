# Websockets in Node JS

In most web applications it is perfectly fine to communicate with clients' browsers the usual way. They initialize a connection with a request, which is processed by the sever and returned as a response. There might come that time, though, when you would like to notify your users about something, without making them ask for it first. This is what websockets are for.

### Old-fashioned HTTP server

Let's create a simple HTTP server using express:

    const express = require('express');
    const app = express();
    app.use('/broadcast/:message', (req, res) => {
       const { message } = req.params;
       res.json({message});
    });
    server.listen(3000);

As you can see, whenever a user calls `/broadcast/:message` URL, they get the reponse containing passed message. But what should we do when we want to publish this message to other clients, even though they haven't requested it?

### Websockets with socket.io

[Socket.io](http://socket.io/) is arguably the most popular websocket library available, at least in Node.JS world. It is very simple to use, yet powerful enough to set your WS server up in seconds. What changes are necessary to make our simple server support websockets?

In order to start a WS server, we first need a standard HTTP one. Not an Express server, but rather a plain-old object from `http` library. In order to do that, we need to instantiate it. We can pass our Express app as an argument, therefore all declared endpoints are still available:

    const SocketIO = require('socket.io');
    ...
    const server = http.createServer(app);

Then, we need to define what will happen in our WS server. For a simple example, we limit ourselves to three actions: connecting, disconnecting and emiting some data.

    const clients = {};
    ...
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

As you can see, WS server is event-driven. We listen for something to happen (`xxx.on('name', handlerFunc)` is a classical way we define listeners in Java Script) and react with some action. Whenever a client establishes a connection to our server, we greet them with a welcome message.

Additionally, it is useful to store all active WS connections, eg in an object, where client's ID is the key. Whenever the user disconnects, we just delete this entry in our object not to attempt to send any data to a non-existing connection.

Sending data to all clients is very simple, so we can easily extend our existing `/broadcast/:message` handler (with a little help from [lodash](https://lodash.com/), for simplicity):

    app.use('/broadcast/:message', (req, res) => {
       const { message } = req.params;

      _.each(clients, (c) => c.emit('message', {message}));

      res.json({message});
    });

Now, whenever we open, eg. `/broadcast/hello` on our server's address, all clients connected via WS receive that _hello_ message.

### Client side

What we've created is just one side of the story, as our clients must be prepared for this kind of communication to utilize websocket connection. Fortunately, socket.io provides a solution for client-side code as well.

First, we need to have socket.io available in browser. We can import it via `npm` for more complex applications, or we can just place it in our `index.html` as a script served by some CDN:

    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.8/socket.io.js"></script>

The code handling the connection is even easier here then on the server side, as we just need to set up a connection and start listening for data. No need to handle disconnect here (unless you want to do this manually), as it is closed automatically on browser close or refresh:

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>WebSockets example</title>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.8/socket.io.js"></script>
      </head>
      <body>
        <script type="text/javascript">
          var client = io('localhost:3000');

          client.on('message', function (data) {
              console.log('data', data);
          });
        </script>
      </body>
    </html>

### Running the example

After starting our server, nothing will show up in the console, until first connection is opened:

    // server
    $ node app.js
    // first connection opened in browser
    new connection /#yrQqssS9d7dxsCthAAAA

At that time, the server immediately sends a greeting:

    // client console
    data Object {message: "cool message"}

We can test our broadcast endpoint as well - entering `/broadcast/happy birthday` URL result in a message received by the client:

    // client console
    data Object {message: "happy birthday"}

### Summary

Creating a websocket server is very simple, especially in Node JS. It didn't require any special tricks, any magic or lots of code. Getting to know how WS can be built can reallly become useful once you create some kind of data-heavy application, where the clients need to be notified asynchronously, without eg. asking for data in a loop.

Source code of this example is available [on Github](https://github.com/mycodesmells/nodejs-websockets).
