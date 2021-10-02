import { useEffect, useState } from 'react';
import '../App.css';
import type { VehicleState } from '../carApp/CarApp';

export const AdminApp = () => {
  // The collection of vehicles and their states from the server.
  // State value is a map of <vin, VehicleState>.
  const [vehicles, setVehicles] = useState<Record<string, VehicleState>>({});

  useEffect(() => {
    // Get connected vehicles from server on page load.
    const vehiclesPromise = fetch('http://localhost:3000/api', {method: 'GET'});
    vehiclesPromise.then((response) => {
      response.json().then((vehicles) => {
        // Set the collection of vehicleData into the state value.
        setVehicles(vehicles.vehicleData);
      })
    }).catch((error) => {
      console.log("Problem retrieving vehicle data:", error);
    })
  }, []);

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
          </tr>
          </thead>
          <tbody>
        {
          Object.keys(vehicles).map((vin: string) => {
            const vehicle: VehicleState = vehicles[vin];
            return (<tr key={vin}>
              <td style={{fontWeight: "bold"}}>{vin}</td>
              <td>{vehicle.driveStatus}</td>
              <td>{vehicle.speed}</td>
              <td>{vehicle.headlightStatus}</td>
              <td>{vehicle.lockStatus}</td>
            </tr>);
          })
        }
        </tbody>
        </table>
      </div>
    </div>
  );
}
