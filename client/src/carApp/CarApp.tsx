import { useCallback, useEffect, useState } from 'react';
import { CarStatus } from './CarStatus';
import { CarControls } from './CarControls';
import '../App.css';

// The type representing the set of vehicle status properties.
export type VehicleState = {
  vin: number;
  headlightStatus: 'ON' | 'OFF';
  driveStatus: 'PARKED' | 'DRIVE' | 'REVERSE';
  lockStatus: 'LOCKED' | 'UNLOCKED';
  speed: number;
  location: { x: string; y: string };
  isPaceCar: boolean;
};

export const CarApp = () => {
  // Reference to the WebSocket connection.
  const [ws, setWs] = useState<WebSocket>();
  // The connected vehicle's initial state, with uninitialized
  // VIN value (generated below on page load).
  const [vehicleState, setVehicleState] = useState<VehicleState>({
    vin: 0,
    headlightStatus: 'OFF', 
    driveStatus: 'PARKED', 
    lockStatus: 'UNLOCKED',
    speed: 0,
    location: { x: '', y: '' },
    isPaceCar: false
  });

  // Page load initialization effect.
  useEffect(() => {
    // Assign a VIN to the vehicle.
    const vin = getVin();
    // Maintain vehicle state in closure for async message receiving.
    let vehicle = vehicleState;
    // Connect the vehicle to the server.
    makeConnection(vehicle, vin);

    // This effect hook should run only once on page load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Helper functions

  // Get a random VIN number.
  const getVin = useCallback((): number => {
    // Use random integer for car VIN.
    const vin = Math.ceil(Math.random() * 1000);
    return vin;
  }, []);

  // Get a random speed number between 0-60.
  const getSpeed = useCallback((): number => {
    const speed = Math.floor(Math.random() * 60);
    return speed;
  }, []);

  // Get a random location tuple.
  const getLocation = useCallback((): {x: string, y: string} => {
    const x = (Math.random() * 100).toFixed(4);
    const y = (Math.random() * 100).toFixed(4);
    return { x, y };
  }, []);

  // Honk the horn.
  const horn = useCallback(() => {
    var snd = new Audio("horn.mp3"); // buffers automatically when created
    snd.play();
  }, []);

  // Make the WebSocket connection.
  const makeConnection = useCallback((vehicle: VehicleState, vin: number) => {
      // Set VIN value on vehicle state.
      let vehicleStatus = {...vehicle, vin};

    // Connect to the remote websocket server.
    const ws = new WebSocket(`ws://localhost:8000?clientId=${vin}`);
    setWs(ws);
    // On successful WS connection, send a message with the initial vehicle state.
    ws.addEventListener('open', () => {
      console.log('socket opened');
      setVehicleState(vehicleStatus);
      // Notify server of vehicle connection status.
      ws.send(JSON.stringify({
        type: 'connect', 
        vehicleState: vehicleStatus,
      }));
      console.log('initial vehicle status sent');
      // After connection is open, set up status update interval.
      const timeoutId = setInterval(() => {
        const speed = getSpeed();
        const location = getLocation();
        vehicleStatus = { ...vehicleStatus, speed, location, driveStatus: 'DRIVE' as const, vin};
        setVehicleState(vehicleStatus);
        // Notify server of vehicle status.
        ws.send(JSON.stringify({
          type: 'statusUpdate', 
          vehicleState: vehicleStatus,
        }));

      }, 5000);
    });
    
    // Listen for server messages.
    ws.addEventListener('message', (message) => {
      const messageData = JSON.parse(message.data);
      switch(messageData.type) {
        // Pace car status changed on this vehicle.
        case 'paceCarStatus':
          if(messageData.vin === vehicleStatus.vin) {
            const isPaceCar = messageData.isPaceCar ?? false;
            vehicleStatus = {...vehicleStatus, isPaceCar};
            setVehicleState(vehicleStatus);
            console.log("Vehicle paceCar status updated:", isPaceCar);  
          }
          break;
        // Honk the horn on this vehicle.
        case 'horn':
          if(messageData.vin === vehicleStatus.vin) {
            horn();
            console.log("my horn was honked.");
          }
          break;
      }
      console.log('received: %s', messageData);
    });

    ws.addEventListener('close', () => {
      // When car is disconnected, "pace car" status is transferred to another car.
      vehicleStatus = {...vehicleStatus, isPaceCar: false};
      setVehicleState(vehicleStatus);
    });
  }, [getLocation, getSpeed, horn]);

  // Disconnect the vehicle from the server.  (For testing.)
  const disconnect = useCallback(() => {
    if(!!ws && ws.readyState === ws.OPEN) {
      ws.close();
    }
  }, [ws]);
  
  // Reconnect the vehicle to the server.
  const reconnect = useCallback(() => {
    if(!!ws && ws.readyState !== ws.OPEN) {
      makeConnection(vehicleState, vehicleState.vin);
    }
  }, [makeConnection, vehicleState, ws]);



  return (
    <div style={{ marginTop: "24px"}}>
      <header className="App-text">
        <div>
          Vehicle app running | ID {vehicleState.vin}
          {vehicleState.isPaceCar ? (<span style={{fontWeight: "bold"}}> (Pace car)</span>) : null}
        </div>
      </header>
      <CarStatus vehicleState={vehicleState}/>
      <CarControls horn={horn} disconnect={disconnect} reconnect={reconnect} connection={ws}/>
    </div>
  );

}
