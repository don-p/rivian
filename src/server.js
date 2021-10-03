const ws = require('ws');
const port = 8000;

const ADMIN_ID = 'ADMIN';

/**
 * WebSocket server.
 */

// Set up a websocket server.
// Logs any events that are received.
const wsServer = new ws.WebSocketServer({ port: port });

// Server-scoped Map objects.
// This project uses in-memory map objects to store the vehicle data.
const vehicleDB = {};
// Map of socket instances to vehicles.
const clients = {};

// Message queue (in-memory)
const messageQueue = [];

wsServer.on('connection', (socket, request) => {
  console.log(`Websocket app listening on port ${port}!`);

  const params = new URLSearchParams(request.url.substr(2));
  const clientId = params.get('clientId');
  // Save the clientId in the socket object as an id reference.
  socket.client = clientId;

  // Once connected, set up Websocket message handler.
  socket.on('message', message => 
    {
      const messageData = JSON.parse(message.toString())
      console.log("received message:", message);

      // Handle received messages by message `type` property.
      switch(messageData.type) {
        // Initial connection message, with initial vehicle state.
        case 'connect':
          if(!messageData.isAdmin) {
            const vehicle = messageData.vehicleState;
            const VIN = vehicle.vin;
            console.log("Socket connected", VIN);
            // Add the vehicle to the collection.
            vehicleDB[VIN] = vehicle;
            // If this is first connected vehicle, set is as "pace car".
            if (Object.keys(vehicleDB).length === 1) {
              vehicle.isPaceCar = true;
              paceCarUpdate(VIN);
            }
            console.log("Vehicle connected with VIN:", VIN, vehicle);
          } 

          // Send updates to admin app when new vhicle connects.
          broadcast(wsServer, {type: 'carStatus', vehicles: vehicleDB});
          break;
        case 'horn':
          const clientId = messageData.vin;
          console.log("Horn for vehicle", clientId);
          broadcast(wsServer, {type: 'horn', vin: clientId});
          break;
        case 'message':
          console.log("Message:", JSON.stringify(messageData));
          break;
        default:
          console.log("unsupported message type", messageData);
      }
    });

  socket.on('close', (code) => {
    const clientId = socket.client;
    if(clientId !== ADMIN_ID) {
      const disconnectedVehicle = vehicleDB[clientId];
      const isPaceCar = disconnectedVehicle.isPaceCar;

      // Remove the disconnected vehicle from the conected vehicles collections.
      // delete vehicleDB[vin];
      // delete clients[vin];
      console.log("Vehicle disconnected with VIN:", socket.client, disconnectedVehicle);

      // If disconnected vehicle was "pace car", and there are more cars connected,
      // select a new one from the connected vehicles collection.
      if (isPaceCar && Object.keys(vehicleDB).length > 0) {
        const newPaceCarVin = Object.keys(vehicleDB)[0];
        paceCarUpdate(newPaceCarVin);
      }
    }
  });
});

/**
 * WebSocket message functions.
 */
// Broadcast message to all clients.
function broadcast(wsServer, message) {
  wsServer.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      sendBuffered(client, message);
    }
  });
}

// Update the selected vehicle to be the "pace car".
function paceCarUpdate(newPaceCarVin) {
  const newPaceCar = vehicleDB[newPaceCarVin];
  newPaceCar.isPaceCar = true;
  console.log("New pace car selected with VIN", newPaceCarVin);
  // Send message to new vehicle notifying of pace car status change.
  const paceCarSocket = clients[newPaceCarVin];
  broadcast(wsServer, {type: 'paceCarStatus', vin: newPaceCarVin, isPaceCar: true});
}

// Send an optionally-buffered message to the specified socket connection.
// If the socket is in a connected state then send the message directly;
// if the socket is in a disconnected state then send the message to the
// message queue for future replay.
function sendBuffered(socket, message) {

  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.log("Buffering message for socket:", socket.client, message);
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

