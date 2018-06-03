
const WebSocket = require('ws');
const port = 8086;
const Room = require('./room.js');

const MSG_TYPES = {
    SELF_CONNECTED: 'SELF_CONNECTED',
    OTHER_CONNECTED: 'OTHER_CONNECTED'
}

const wss = new WebSocket.Server({ port });
let room = new Room();
wss.on('connection', function connection(ws) {
    connectionFeedback(wss,ws); // 新用户连接，通知该用户其他用户的userId，通知其他用户该用户的userId
    ws.on('message', function incoming(data) {
        const msg = JSON.parse(data);
        sendMsg(wss,ws,msg);
    });
});
function connectionFeedback(wss,ws) {
     // 用户连接，发送给该用户其他上线用户userId和roleData列表，并生成该用户userId，再将userId广播给其他用户
    const useridlist = Array.from(wss.clients).filter(client => client.userId).map(client => client.userId);
    room.check(useridlist);
    const userId = Date.now() + '';
    console.log(userId,'connect success');
    console.log('the room has',room.userNumber,'people')
    const otherDataList = room.getUserDataList();
    const roleData = room.addUser(userId);
    // 连接成功，通知该用户，其他客户端信息
    let msg = {
        msg_type: MSG_TYPES.SELF_CONNECTED,
        userId,
        content: {
            roleData, // 给用户分配位置
            userDataList: otherDataList
        }
    };
    ws.send(JSON.stringify(msg));
    Object.defineProperty(ws,'userId',{
        configurable: false,
        writable: false,
        value: userId
    });
    // 通知其他客户端，该用户已上线
    msg = {
        msg_type: MSG_TYPES.OTHER_CONNECTED,
        userId,
        content: {
            roleData
        }
    };
    broadcast(wss,ws,msg);
}
function sendMsg(wss,ws,msg) { // 转发数据，将数据转发给对应userId接收方，并将发送方userId传给接收方
    if (msg.userId) {
        const client = Array.from(wss.clients).find(client => client.userId === msg.userId);
        msg.userId = ws.userId;
        if(client) client.send(JSON.stringify(msg));
    } else {
        msg.userId = ws.userId;
        broadcast(wss,ws,msg);
    }
}
function broadcast(wss,ws,data) {
    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

}