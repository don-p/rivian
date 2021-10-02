const express = require('express');
const ws = require('ws');

const app = express();
const port = 8000;

// Set up a headless websocket server.
// Server logs any events that are received.
const wsServer = new ws.Server({ noServer: true });

// Server-scoped Map object.
// This project uses an in-memory map to store the vehicle data.
const vehicleDB = {};

wsServer.on('connection', socket => {
  // Once connected, set up Websocket message handler.
  socket.on('message', message => 
    {
      const messageData = JSON.parse(message.toString())
      console.log("received message:", message);

      // Handle received messages by message `type` property.
      switch(messageData.type) {
        // Initial connection message, with initial vehicle state.
        case 'connect':
          const VIN = messageData.vin;
          vehicleDB[VIN] = messageData.vehicleState;
          break;
        case 'message':
          console.log("Message:", JSON.stringify(messageData));
          break;
        default:
          console.log("unsupported message type", messageData);
      }

      console.log("Vehicles:", JSON.stringify(vehicleDB));
    });
});

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
  });
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
    console.log(`Websocket app listening on port ${port}!`)
  });
});

// Default server route.
app.get('/', (req, res) => {
  res.send('Hello World!')
});

// API server route, returns the tracked connected vehicles collection.
app.get('/api', (req, res) => {
    res.send({vehicleData: vehicleDB});
  });
  
