import { useEffect, useState } from 'react';
import '../App.css';

// The type representing the set of vehicle status properties.
export type VehicleState = {
  headlightStatus: 'ON' | 'OFF';
  driveStatus: 'PARKED' | 'DRIVE' | 'REVERSE';
  lockStatus: 'LOCKED' | 'UNLOCKED';
  speed: number;
};

export const CarApp = () => {
  // Reference to the WebSocket connection.
  const [ws, setWs] = useState<WebSocket>();
  // The connected vehicle's VIN value (generated below on page load).
  const [VIN, setVIN] = useState<number>();

  // Page load initialization effect.
  useEffect(() => {
    // Use random integer for car VIN.
    const vin = Math.ceil(Math.random() * 1000);
    setVIN(vin);

    // Connect to the remote websocket server.
    const ws = new WebSocket('ws://localhost:8000');
    setWs(ws);
    // On successful WS connection, send a message with the initial vehicle state.
    ws.addEventListener('open', function open() {
      console.log('socket opened');
      const initialStatus: VehicleState = { 
          headlightStatus: 'OFF', 
          driveStatus: 'PARKED', 
          lockStatus: 'UNLOCKED',
          speed: 0 
        }
      ws.send(JSON.stringify({
        type: 'connect', 
        vin: vin, 
        vehicleState: initialStatus,
      }));
      console.log('initial vehicle status sent');
    });
    
    ws.addEventListener('message', function incoming(message) {
      console.log('received: %s', message);
    });
  }, []);

  // Send a message to the websocket server.
  const sendMessage = (message: any) => {
    if (!!ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({type: 'message', vin: VIN, message: message}));
    }
  };

  return (
    <div>
      <header className="App-text">
        <div>Vehicle app running.</div>
      </header>
      <button onClick={() => sendMessage('test message')}>Send message</button>
    </div>
  );
}
