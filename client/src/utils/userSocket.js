class UserSocket {
    constructor(url) {
        // 建立websocket连接
        this.ws = new WebSocket(url);
        this.ws.addEventListener('message',({data}) => {
            const res = JSON.parse(data);
            this.onData(res);
        });
    }
    onData() {}
    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }
}
export default UserSocket