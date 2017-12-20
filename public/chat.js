class Page {
    constructor() {
        this.UI = {
            group: document.querySelector('.group'),
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
            btn_call.classList.add('hide');
            const url = 'wss://www.yonechen.com/wss/';// ws://127.0.0.1:8084
            const user = new User(url,Date.now() +'',this.stream,this.createVideo.bind(this),this.deleteVideo.bind(this));
            //-----
            // const ws = new WebSocket('ws://127.0.0.1:8007');
            // ws.addEventListener('open', e => {
            // });
            //-----
        });
    }
    createVideo(token,source) {
        const {group} = this.UI;
        const box = document.createElement('div');
        box.classList.add('box');
        const title = document.createElement('span');
        title.innerText = token;
        title.classList.add('title');
        const video = document.createElement('video');
        video.classList.add('video');
        video.autoplay = true;
        video.src = source;
        box.id = token;
        box.appendChild(title);
        box.appendChild(video);
        group.appendChild(box);
    }
    deleteVideo(token) {
        const {group} = this.UI;
        const box = document.getElementById(token);
        group.removeChild(box);
    }
    getMediaStream() {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
    }
}
class User {
    constructor(url,userID,stream,userJoinCallback,userLeaveCallback) {
        this.stream = stream;
        this.userJoinCallback = userJoinCallback;
        this.userLeaveCallback = userLeaveCallback;
        this.ws = new WebSocket(url);
        this.peerSets = {};
        this.ws.addEventListener('message',e => {
            const msg = JSON.parse(e.data);
            console.log(msg);
            const {msg_type,content,tokenList,token} = msg;
            switch(msg_type) {
                case 'I_JOIN': this.createPeersAndOffers(tokenList);break; // 当我加入时，创建对其他人的连接，并发起offer
                case 'OTHER_JOIN': this.addPeer(token);break; // 有新人加入时，我收到通知，建立一条新连接
                case 'CANDIDATE': this.addCandidate(token,content.icecandidate);break; // 当收到 token用户 发来的candidate地址，设置
                case 'OFFER': this.answer(token,content.offer);break; // 当收到 token用户 发来的offer时，回送answer
                case 'ANSWER': this.receiveAnswer(token,content.answer);break;
            }
        });
        // this.peer.oniceconnectionstatechange = function(e) {
        // // onIceStateChange(pc1, e);
        // };
    }
    createPeersAndOffers(tokenList) {
        const othersNumber = tokenList.length;
        if (othersNumber < 1 || othersNumber > 10) return; //两个人在线上时才需要建立连接
        for (let i = 0; i < othersNumber; i++) { //n个人在线时，建立 n-1个连接
            const token = tokenList[i];
            this.addPeer(token); // 创建对 token用户 的连接
            this.offer(token); // 发送对 token用户 的offer
        }
    }
    addPeer(token) {
        const {stream,userJoinCallback,userLeaveCallback} = this;
        const config = {
            'iceServers': [{ 'url': 'stun:stun.services.mozilla.com' }, { 'url': 'stun:stunserver.org' }, { 'url': 'stun:stun.l.google.com:19302' }]
        };
        const peer = new RTCPeerConnection(config);
        peer.addEventListener('icecandidate',e => { //在stun查询到自己的ip外网地址时，发送给 token用户
            const msg = {
                msg_type: 'CANDIDATE',
                token,
                content: {
                    icecandidate: e.candidate
                }
            };
            this.wsSend(msg);
          });
        peer.addStream(stream);
        peer.addEventListener('addstream', e => {
            userJoinCallback(token,window.URL.createObjectURL(e.stream));
        });
        peer.addEventListener('iceconnectionstatechange', e => {
            if(peer.iceConnectionState == 'disconnected') {
                console.log(token + 'Disconnected');
                userLeaveCallback(token);
            }
        })
        this.peerSets[token] = peer;
    }
    addCandidate(token,icecandidate) {
        const peer = this.peerSets[token];
        peer.addIceCandidate(new RTCIceCandidate(icecandidate));
    }
    async offer(token) { // 我是请求方 发起offer并设置本身的SDP信息
        // const {peerSets,ws,state,userID} = this;
        const peer = this.peerSets[token];
        const offer = await peer.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        });
        await peer.setLocalDescription(offer);
        const msg = {
            msg_type: 'OFFER',
            token,
            content: {
                offer
            }
        };
        this.wsSend(msg);
    }
    async answer(token,offer) { // 我是响应方 收到请求方offer后，设置对方的SDP信息，发起answer，设置本身的SDP信息
        // const {peer,ws,state,userID} = this;
        const peer = this.peerSets[token];
        await peer.setRemoteDescription(offer);
        // this.state.remoteDescription = offer;

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        // this.state.localDescription = answer;

        const msg = {
            msg_type: 'ANSWER',
            token,
            content: {
                answer
            }
            
        };
        this.wsSend(msg);
    }
    async receiveAnswer(token,answer) { // 我是请求方 收到响应方answer后，设置对方的SDP信息
        // const {peer,ws,state} = this;
        const peer = this.peerSets[token];
        await peer.setRemoteDescription(answer);
        // this.state.remoteDescription = answer;
    }
    wsSend(msg) {
        this.ws.send(JSON.stringify(msg));
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