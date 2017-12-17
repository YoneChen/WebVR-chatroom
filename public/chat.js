class Page {
    constructor() {
        this.UI = {
            btn_call: document.getElementById('btn-call'),
            video_local: document.getElementById('video-local'),
            // video_remote: document.getElementById('video-remote')
        };
        this.bindEvent();
        this.init();
    }
    async init() {
        const { btn_call,video_local } = this.UI;
        this.stream = await this.getMediaStream();
        const url = URL.createObjectURL(this.stream);
        video_local.src = url;
    }
    bindEvent() {
        const { btn_call,video_local } = this.UI;
        btn_call.addEventListener('click', e => {
            btn_call.disable = true;
            const user = new User('ws://127.0.0.1:8007',Date.now() +'',this.stream,source => {
                const video_remote = document.createElement('video');
                video_remote.autoplay = true;
                video_remote.width = 600;
                video_remote.height = 600;
                video_remote.src = source;
                document.body.insertBefore(video_remote,video_local);
            });
            //-----
            // const ws = new WebSocket('ws://127.0.0.1:8007');
            // ws.addEventListener('open', e => {
            // });
            //-----
        });
    }
    getMediaStream() {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
    }
}
class User {
    constructor(url,userID,stream,videoJoinCallback) {
        this.userID = userID;
        this.stream = stream;
        this.ws = new WebSocket(url);
        this.state = {
            localDescription: null,
            remoteDescription: null,
        }
        var config = {
            'iceServers': [{ 'url': 'stun:stun.services.mozilla.com' }, { 'url': 'stun:stunserver.org' }, { 'url': 'stun:stun.l.google.com:19302' }]
        };
        this.peer = new RTCPeerConnection(config);
        this.peer.addEventListener('icecandidate',e => {
            debugger
            const info = {
                userID,
                icecandidate: e.candidate
            };
            this.ws.send(JSON.stringify(info));
          });
        this.ws.addEventListener('message',e => {
            debugger
            const data = JSON.parse(e.data);
            console.log(data);
            const {icecandidate,offer,answer,onlineNumber} = data;
            if (onlineNumber && onlineNumber >1) this.offer();
            if(icecandidate) this.peer.addIceCandidate(new RTCIceCandidate(icecandidate));
            if(offer) this.answer(offer);
            if(answer) this.receiveAnswer(answer);
        });
        this.peer.addStream(stream);
        this.peer.addEventListener('addstream', e => {
            videoJoinCallback(window.URL.createObjectURL(e.stream));

        });
        this.peer.oniceconnectionstatechange = function(e) {
        // onIceStateChange(pc1, e);
        };
    }
    async offer() { // 我是请求方 发起offer并设置本身的SDP信息
        const {peer,ws,state,userID} = this;
        const offer = await this.peer.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        });
        await peer.setLocalDescription(offer);
        this.state.localDescription = offer;
        debugger
        const info = {
            userID,
            offer
        };
        ws.send(JSON.stringify(info));
            // //对方接收到这个offer
            // theirConnection.setRemoteDescription(offer);
            // //对方产生一个answer
            // theirConnection.createAnswer().then(answer => {
            //     theirConnection.setLocalDescription(answer);
            //     //本方接收到一个answer
            //     yourConnection.setRemoteDescription(answer);
            // })
    }
    async answer(offer) { // 我是响应方 收到请求方offer后，设置对方的SDP信息，发起answer，设置本身的SDP信息
        const {peer,ws,state,userID} = this;
        await peer.setRemoteDescription(offer);
        this.state.remoteDescription = offer;

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        this.state.localDescription = answer;

        const info = {
            userID,
            answer
        };
        ws.send(JSON.stringify(info));
    }
    async receiveAnswer(answer) { // 我是请求方 收到响应方answer后，设置对方的SDP信息
        const {peer,ws,state} = this;
        await peer.setRemoteDescription(answer);
        this.state.remoteDescription = answer;
    }
}
// javascript code
// var button = document.getElementById('start-peer-connection');
// button.onclick = function() {
//     this.disabled = true;

//     var peer = new RTCPeerConnection(iceServers, optional);    
//     peer.createOffer(function(offerSDP) {
//         peer.setLocalDescription(offerSDP);
//         socket.send({
//             targetUser: 'target-user-id',
//             offerSDP: offerSDP
//         });
//     }, onfailure, sdpConstraints);
// };
new Page();