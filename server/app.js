const WebSocket = require('ws');
const Room = require('./room.js');
const wss = new WebSocket.Server({ port: 8086 });
let globalOnlineCount = 0;
let room = new Room();
wss.on('connection', function connection(ws) {
    connectionFeedback(wss,ws); // 新用户连接，通知该用户其他用户的userId，通知其他用户该用户的userId
    ws.on('message', function incoming(data) {
        const msg = JSON.parse(data);
        sendMsg(wss,ws,msg);
    });
});
function createRoleData(index) {

    return roleDataSet[index];
}
function connectionFeedback(wss,ws) {
     // 用户连接，发送给该用户其他上线用户userId和roleData列表，并生成该用户userId，再将userId广播给其他用户
     const useridlist = Array.from(wss.clients).filter(client => client.userId).map(client => client.userId);
    room.check(useridlist);
    const userId = `用户${Date.now()}`;
    const otherDataList = room.getUserDataList();
    const roleData = room.addUser(userId);
    let msg = {
        msg_type: 'I_JOIN',
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
    // ------
    msg = {
        msg_type: 'OTHER_JOIN',
        content: {
            roleData
        },
        userId
    };
    broadcast(wss,ws,msg);
}
function sendMsg(wss,ws,msg) { // 转发数据，将数据转发给对应userId接收方，并将发送方userId传给接收方
    if (msg.userId) {
        const client = Array.from(wss.clients).filter(client => client.userId === msg.userId)[0];
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