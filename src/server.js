const express = require('express');
const ws = require('ws');

const app = express();
const port = 8000;

/**
 * WebSocket server.
 */

// Set up a headless websocket server.
// Server logs any events that are received.
const wsServer = new ws.Server({ noServer: true });

// Server-scoped Map objects.
// This project uses an in-memory map to store the vehicle data.
const vehicleDB = {};
// Map of socket instances to vehicles.
const clients = {};

// Message queue (in-memory)
const messageQueue = [];

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
          const vehicle = messageData.vehicleState;
          const VIN = vehicle.vin;
          // Associate socket instance with vehicle.
          clients[VIN] = socket;
          // Associate the vehicle with the socket instance via a client id.
          socket.client = VIN;
          // Add the vehicle to the collection.
          vehicleDB[VIN] = vehicle;
          // If this is first connected vehicle, set is as "pace car".
          if (Object.keys(vehicleDB).length === 1) {
            vehicle.isPaceCar = true;
            paceCarUpdate(VIN);
          }
          console.log("Vehicle connected with VIN:", VIN, vehicle);
          break;
        case 'message':
          console.log("Message:", JSON.stringify(messageData));
          break;
        default:
          console.log("unsupported message type", messageData);
      }

      console.log("Vehicles:", JSON.stringify(vehicleDB));
    });

  socket.on('close', (code) => {
    const vin = socket.client;
    const disconnectedVehicle = vehicleDB[vin];
    const isPaceCar = disconnectedVehicle.isPaceCar;

    // Remove the disconnected vehicle from the conected vehicles collections.
    delete vehicleDB[vin];
    delete clients[vin];
    console.log("Vehicle disconnected with VIN:", socket.client, disconnectedVehicle);

    // If disconnected vehicle was "pace car", and there are more cars connected,
    // select a new one from the connected vehicles collection.
    if (isPaceCar && Object.keys(vehicleDB).length > 0) {
      const newPaceCarVin = Object.keys(vehicleDB)[0];
      paceCarUpdate(newPaceCarVin);
    }
  });
});

/**
 * WebSocket message functions.
 */

// Update the selected vehicle to be the "pace car".
function paceCarUpdate(newPaceCarVin) {
  const newPaceCar = vehicleDB[newPaceCarVin];
  newPaceCar.isPaceCar = true;
  console.log("New pace car selected with VIN", newPaceCarVin);
  // Send message to new vehicle notifying of pace car status change.
  const paceCarSocket = clients[newPaceCarVin];
  sendBuffered(paceCarSocket, JSON.stringify({type: 'paceCarStatus', isPaceCar: true}));
}

// Send an optionally-buffered message to the specified socket connection.
// If the socket is in a connected state then send the message directly;
// if the socket is in a disconnected state then send the message to the
// message queue for future replay.
function sendBuffered(socket, message) {

  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    messageQueue.push({client: socket.client, message});
  }
  
}

// Replay a "snapshot" of messages that have been buffered for a
// specific client while disconnected.
function getBuffered(client) {

  const socket = clients[client];

  if (socket.readyState === socket.OPEN) {
    const messages = messageQueue.filter((item) => {
      return item.client === client;
    });

    messages.forEach((message) => {
      // send the saved message.
      socket.send(message);
      // remove the sent message from the queue.
      const index = messageQueue.indexOf(item);
      messageQueue.splice(index, 1);
    });
  }
}

/**
 * WebSocket server.
 */
// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(port, () => {
    console.log(`Rivian server app listening on port ${port}!`);
  });

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
    console.log(`Websocket app listening on port ${port}!`)
  });
});

// API server routes

// Returns the tracked connected vehicles collection.
app.get('/api/vehicles', (req, res) => {
    res.send({vehicleData: vehicleDB});
  });
  
// Honks the horn on specified vehicle.
app.get('/api/horn/:vin', (req, res) => {
  const client = req.params.vin;
  console.log("Horn for vehicle", client);
  const socket = clients[client];
  socket.send(JSON.stringify({type: 'horn'}));
});

