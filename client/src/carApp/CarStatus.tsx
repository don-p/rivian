import type { VehicleState } from './CarApp';
import '../App.css';

type Props = {
    vehicleState: VehicleState;
}

export const CarStatus: React.FC<Props> = ({vehicleState}) => {

    return (
        <div className="App-carstatus">
            <div className="App-carstatus-header" >Current vehicle status:</div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '12px'}}>
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
    );
}