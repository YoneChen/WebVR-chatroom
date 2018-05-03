const config = {
    development: {
        socket_url:  "ws://127.0.0.1:8086"
    },
    production: {
        socket_url:  "wss://www.yonechen.com/webvr-chat/"
    }
}
const env = process.env || "production";
module.exports = config[env];