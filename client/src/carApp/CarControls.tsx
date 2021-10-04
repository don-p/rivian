import '../App.css';

type Props = {
    horn: () => void;
    disconnect: () => void;
    reconnect: () => void;
    connection: WebSocket | undefined;
}

export const CarControls: React.FC<Props> = ({horn, disconnect, reconnect, connection}) => {
    
    return (
        <div>
            <div className="App-carcontrol">
                <button onClick={() => horn()}>Enable control</button>
            </div>
            <div>
                <button onClick={() => disconnect()} disabled={!!connection && connection.readyState !== connection.OPEN}>Disconnect</button>
            </div>
            <div>
                <button onClick={() => reconnect()} disabled={!!connection && connection.readyState === connection.OPEN}>Reconnect</button>
            </div>
        </div>
    )

    
}