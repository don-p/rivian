import { useEffect, useState } from 'react';
import '../App.css';
import type { VehicleState } from '../carApp/CarApp';

export const AdminApp = () => {
  // The collection of vehicles and their states from the server.
  // State value is a map of <vin, VehicleState>.
  const [vehicles, setVehicles] = useState<Record<string, VehicleState>>({});
  // Reference to the WebSocket connection.
  const [ws, setWs] = useState<WebSocket>();

  // Page load initialization effect.
  useEffect(() => {
    // Connect to the remote websocket server.
    const ws = new WebSocket('ws://localhost:8000?clientId=ADMIN');
    setWs(ws);
    // On successful WS connection, send a message with admin ID.
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        type: 'connect', 
        isAdmin: true,
      }));
      console.log('initial admin status sent');
    });
    
    // Listen for server messages.
    ws.addEventListener('message', (message) => {
      const messageData = JSON.parse(message.data);
      switch(messageData.type) {
        // Pace car status changed on this vehicle.
        case 'carStatus':
          const vehicles = messageData.vehicles;
          setVehicles(vehicles);
          console.log("Vehicles status updated");
          break;

      }
      console.log('received: %s', messageData);
    });
    // This effect hook should run only once on page load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  // Honk the horn on the specified vehicle.
  const horn = (vin: number) => {
    if(!!ws && ws.readyState === ws.OPEN) {
      // Honk the horn for the specified vehicle.
      ws.send(JSON.stringify({
          type: 'horn',
          vin
        })
      );
    }
  }

  return (
    <div>
      <header className="App-text">
        <div>Admin app running.</div>
      </header>
      <div className="App-table-container">
        <div  className="App-table-heading App-table-text">Connected vehicles:</div>
        <table className="App-table App-table-text">
          <thead>
          <tr>
            <th>VIN</th>
            <th>Drive Status</th>
            <th>Speed</th>
            <th>Headlights</th>
            <th>Locks</th>
            <th>Pace car?</th>
            <th> </th>
          </tr>
          </thead>
          <tbody>
        {
          Object.values(vehicles).map((vehicle: VehicleState) => {
            return (<tr key={vehicle.vin}>
              <td style={{fontWeight: "bold"}}>{vehicle.vin}</td>
              <td>{vehicle.driveStatus}</td>
              <td>{vehicle.speed}</td>
              <td>{vehicle.headlightStatus}</td>
              <td>{vehicle.lockStatus}</td>
              <td>{vehicle.isPaceCar.toString()}</td>
              <td><button onClick={() => horn(vehicle.vin)}>Horn</button></td>
            </tr>);
          })
        }
        </tbody>
        </table>
      </div>
    </div>
  );
}
