const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8084 });


wss.on('connection', function connection(ws) {
        const connectInfo = {
            onlineNumber: wss.clients.size
        };
    ws.send(JSON.stringify(connectInfo));
    ws.on('message', function incoming(data) {
        data = JSON.parse(data);
      // Broadcast to everyone else.
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    });
  });