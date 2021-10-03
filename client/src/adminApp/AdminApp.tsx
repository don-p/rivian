import { useEffect, useState } from 'react';
import '../App.css';
import type { VehicleState } from '../carApp/CarApp';

export const AdminApp = () => {
  // The collection of vehicles and their states from the server.
  // State value is a map of <vin, VehicleState>.
  const [vehicles, setVehicles] = useState<Record<string, VehicleState>>({});

  useEffect(() => {
    // Get connected vehicles from server on page load.
    const vehiclesPromise = fetch('http://localhost:3000/api/vehicles', {method: 'GET'});
    vehiclesPromise.then((response) => {
      response.json().then((vehicles) => {
        // Set the collection of vehicleData into the state value.
        setVehicles(vehicles.vehicleData);
      })
    }).catch((error) => {
      console.log("Problem retrieving vehicle data:", error);
    })
  }, []);

  const horn = (vin: number) => {
    // Honk the horn for the specified vehicle.
    const hornPromise = fetch(`http://localhost:3000/api/horn/${vin}`, {method: 'GET'});
    hornPromise.catch((error) => {
      console.log("Problem locating vehicle:", error);
    })
    
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
