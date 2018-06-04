const defaultConfig = {
    'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stunserver.org' },
        {
            'urls': ['turn:119.29.119.131:3478?transport=tcp','turn:119.29.119.131:3478?transport=udp'],
            "username": "yonechen",
            "credential": "yonechen",
            "credentialType": 'password'
        }]
}
const config = {
    development: {
        ...defaultConfig,
        socketUrl:  "ws://127.0.0.1:8086",
    },
    production: {
        ...defaultConfig,
        socketUrl:  "wss://www.yonechen.com/webvr-chatroom/wss/"
    }
}
const env = process.env.NODE_ENV || "production";
export default config[env];