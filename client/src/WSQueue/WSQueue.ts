export class WSQueue {

    messageQueue: Array<any> = [];
    socket?: WebSocket;

    setWs(ws: WebSocket) {
        this.socket = ws;
    }

    // Send a queued/buffered message to the specified socket connection.
    // If the socket is in a connected state then:
    //  1. check for any queued messages, and send them.
    //  2. queue should be empty after sending all queued messages.
    //  3. send the incoming message directly.
    // If the socket is in a disconnected state then send the message to the
    // message queue for future replay.
    send(message: any) {
        if(!!this.socket) {
            if (this.socket.readyState === this.socket.OPEN) {
                if(this.messageQueue.length > 0) {
                    while(this.messageQueue.length > 0) {
                        // treat array as queue.
                        const queuedMessage = this.messageQueue.shift();
                        this.socket.send(JSON.stringify(queuedMessage));
                    }
                }
                this.socket.send(JSON.stringify(message));
            } else {
                console.log("Buffering message for socket:", message);
                this.messageQueue.push(message);
            }
        }
    }
}