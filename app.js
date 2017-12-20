const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8084 });
let i = 0;

wss.on('connection', function connection(ws) {
    connectionFeedback(wss,ws); // 新用户连接，通知该用户其他用户的token，通知其他用户该用户的token
    ws.on('message', function incoming(data) {
        const msg = JSON.parse(data);
        sendMsg(wss,ws,msg);
    });
});
function connectionFeedback(wss,ws) {
     // 用户连接，发送给该用户其他上线用户token列表，并生成该用户token，再将token广播给其他用户
    const tokenList = Array.from(wss.clients).filter(client => client != ws).map(client => client.token);
    let msg = {
        msg_type: 'I_JOIN',
        tokenList
    };
    ws.send(JSON.stringify(msg));
    const token = `用户${++i}`;
    Object.defineProperty(ws,'token',{
        configurable: false,
        writable: false,
        value: token
    });
    // ------
    msg = {
        msg_type: 'OTHER_JOIN',
        token
    };
    broadcast(wss,ws,msg);
}
function sendMsg(wss,ws,msg) { // 转发数据，将数据转发给对应token接收方，并将发送方token传给接收方
    const client = Array.from(wss.clients).filter(client => client.token === msg.token)[0];
    msg.token = ws.token;
    client.send(JSON.stringify(msg));
}
function broadcast(wss,ws,data) {
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

}