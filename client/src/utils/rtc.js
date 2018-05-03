
import 'webrtc-adapter';
const noop = () => {};
class UserRTC {
    constructor({ url,IJoin = noop,otherJoin = noop,peerConnected = noop,peerDisconnected = noop,receiveRoleInfo = noop }) {
        this.url = url;
        this.IJoinCallback = IJoin;
        this.otherJoinCallback = otherJoin;
        this.peerConnectedCallback = peerConnected;
        this.peerDisconnectedCallback = peerDisconnected;
        this.receiveRoleInfoCallback = receiveRoleInfo;
        this.getMediaStream().then(stream => {
            this.connect(stream);
        });
        // this.peer.oniceconnectionstatechange = function(e) {
        // // onIceStateChange(pc1, e);
        // };
    }
    connect(stream) {
        this.stream = stream;
        this.ws = new WebSocket(this.url);
        this.peerSets = {};
        this.ws.addEventListener('message',e => {
            const msg = JSON.parse(e.data);
            // console.log(msg);
            const {msg_type,content,userId} = msg;
            switch(msg_type) {
                case 'I_JOIN': {
                    this.createPeersAndOffers(content.userDataList);
                    this.IJoinCallback({roleData: content.roleData,otherDataList: content.userDataList});
                }break; // 当我加入时，创建对其他人的连接，并发起offer，拿到socket分配的角色信息
                case 'OTHER_JOIN': {
                    this.addPeer(userId);
                    this.otherJoinCallback({userId,roleData:content.roleData});
                }break; // 有新人加入时，我收到通知，建立一条新连接
                case 'CANDIDATE': this.addCandidate(userId,content.icecandidate);break; // 当收到 userId用户 发来的candidate地址，设置
                case 'OFFER': this.answer(userId,content.offer);break; // 当收到 userId用户 发来的offer时，回送answer
                case 'ANSWER': this.receiveAnswer(userId,content.answer);break;
                case 'EXCHANGE': this.receiveRoleInfoCallback({userId,roleData: content.roleData});break;
            }
        });
    }
    getMediaStream() {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });
    }
    createPeersAndOffers(otherDataList) {
        const othersNumber = otherDataList.length;
        if (othersNumber < 1 || othersNumber > 4) return; //两个人在线上时才需要建立连接
        for (let i = 0; i < othersNumber; i++) { //n个人在线时，建立 n-1个连接
            const {userId,roleData} = otherDataList[i];

            this.addPeer(userId); // 创建对 userId用户 的连接
            this.offer(userId); // 发送对 userId用户 的offer
        }
    }
    addPeer(userId) {
        const {stream,peerConnectedCallback,peerDisconnectedCallback,receiveRoleInfoCallback} = this;
        const config = {
            'iceServers': [{ 'url': 'stun:stun.services.mozilla.com' }, { 'url': 'stun:stunserver.org' },
            {
                'url': 'turn:119.29.119.131:3478?transport=tcp',
                "username": "yonechen",
                "credential": "yonechen",
                credentialType: 'password'
            },
            {
                'url': 'turn:119.29.119.131:3478?transport=udp',
                "username": "yonechen",
                "credential": "yonechen",
                credentialType: 'password'
            }]
        };
        const peer = new RTCPeerConnection(config);
        peer.addEventListener('icecandidate',e => { //在stun查询到自己的ip外网地址时，发送给 userId用户
            const msg = {
                msg_type: 'CANDIDATE',
                userId,
                content: {
                    icecandidate: e.candidate
                }
            };
            this.wsSend(msg);
          });
        peer.addStream(stream);
        peer.addEventListener('addstream', e => {
            peerConnectedCallback({
                userId,
                stream: e.stream
            });
        });
        peer.addEventListener('iceconnectionstatechange', e => {
            if(peer.iceConnectionState == 'disconnected') {
                console.log(userId + 'Disconnected');
                peerDisconnectedCallback(userId);
            }
        });
        this.peerSets[userId] = peer;
    }
    addCandidate(userId,icecandidate) {
        try {
            const peer = this.peerSets[userId];
            peer.addIceCandidate(new RTCIceCandidate(icecandidate));
        } catch(err) {console.warn(err); }
    }
    async offer(userId) { // 我是请求方 发起offer并设置本身的SDP信息
        // const {peerSets,ws,state,userID} = this;
        const peer = this.peerSets[userId];
        const offer = await peer.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        });
        await peer.setLocalDescription(offer);
        const msg = {
            msg_type: 'OFFER',
            userId,
            content: {
                offer
            }
        };
        this.wsSend(msg);
    }
    async answer(userId,offer) { // 我是响应方 收到请求方offer后，设置对方的SDP信息，发起answer，设置本身的SDP信息
        // const {peer,ws,state,userID} = this;
        const peer = this.peerSets[userId];
        await peer.setRemoteDescription(offer);
        // this.state.remoteDescription = offer;

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        // this.state.localDescription = answer;

        const msg = {
            msg_type: 'ANSWER',
            userId,
            content: {
                answer
            }
            
        };
        this.wsSend(msg);
    }
    async receiveAnswer(userId,answer) { // 我是请求方 收到响应方answer后，设置对方的SDP信息
        // const {peer,ws,state} = this;
        const peer = this.peerSets[userId];
        await peer.setRemoteDescription(answer);
        // this.state.remoteDescription = answer;
    }
    sendRoleInfo(roleData) {
        const msg = {
            msg_type: 'EXCHANGE',
            content: {
                roleData
            }
        };
        this.wsSend(msg);
    }
    wsSend(msg) {
        this.ws.send(JSON.stringify(msg));
    }
}
export default UserRTC;