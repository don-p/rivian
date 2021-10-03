import { useEffect, useState } from 'react';
import '../App.css';

// The type representing the set of vehicle status properties.
export type VehicleState = {
  vin: number;
  headlightStatus: 'ON' | 'OFF';
  driveStatus: 'PARKED' | 'DRIVE' | 'REVERSE';
  lockStatus: 'LOCKED' | 'UNLOCKED';
  speed: number;
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
    isPaceCar: false
  });

  // Page load initialization effect.
  useEffect(() => {
    // Use random integer for car VIN.
    const vin = Math.ceil(Math.random() * 1000);
    // Maintain vehicle state in closure for async message receiving.
    let vehicle = vehicleState;

    // Connect to the remote websocket server.
    const ws = new WebSocket(`ws://localhost:8000?clientId=${vin}`);
    setWs(ws);
    // On successful WS connection, send a message with the initial vehicle state.
    ws.addEventListener('open', () => {
      console.log('socket opened');
      // Set VIN value on vehicle state.
      vehicle = {...vehicleState, vin}
      setVehicleState(vehicle);
      // Notify server of vehicle connection status.
      ws.send(JSON.stringify({
        type: 'connect', 
        vehicleState: vehicle,
      }));
      console.log('initial vehicle status sent');
    });
    
    // Listen for server messages.
    ws.addEventListener('message', (message) => {
      const messageData = JSON.parse(message.data);
      switch(messageData.type) {
        // Pace car status changed on this vehicle.
        case 'paceCarStatus':
          if(messageData.vin === vehicle.vin) {
            const isPaceCar = messageData.isPaceCar ?? false;
            setVehicleState({...vehicle, isPaceCar});
            console.log("Vehicle paceCar status updated:", isPaceCar);  
          }
          break;
        // Honk the horn on this vehicle.
        case 'horn':
          if(messageData.vin === vehicle.vin) {
            horn();
            console.log("my horn was honked.");
          }
          break;
      }
      console.log('received: %s', messageData);
    });
    // This effect hook should run only once on page load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send a message to the websocket server.
  const sendMessage = (message: any) => {
    if (!!ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({type: 'message', message: message}));
    }
  };

  // Honk the horn.
  const horn = () => {
    var snd = new Audio("horn.mp3"); // buffers automatically when created
    snd.play();
  }

  return (
    <div style={{ marginTop: "24px"}}>
      <header className="App-text">
        <div>
          Vehicle app running | ID {vehicleState.vin}
          {vehicleState.isPaceCar ? (<span style={{fontWeight: "bold"}}> (Pace car)</span>) : null}
        </div>
        <div className="App-carstatus">
        <div style={{ marginBottom: "24px"}}>Current vehicle status:</div>
          <div>
            <table className="App-table App-table-text">
              <tbody>
                <tr>
                  <td className="App-cartable-label">Drive Status:</td>
                  <td className="App-cartable-text">{vehicleState.driveStatus}</td>
                </tr>
                <tr>
                  <td  className="App-cartable-label">Speed:</td>
                  <td className="App-cartable-text">{vehicleState.speed}</td>
                </tr>
                <tr>
                  <td  className="App-cartable-label">Headlights:</td>
                  <td className="App-cartable-text">{vehicleState.headlightStatus}</td>
                </tr>
                <tr>
                  <td  className="App-cartable-label">Locks:</td>
                  <td className="App-cartable-text">{vehicleState.lockStatus}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </header>
      <button onClick={() => horn()}>Enable control</button>
    </div>
  );
}
