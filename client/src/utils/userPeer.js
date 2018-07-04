
import 'webrtc-adapter';
import UserSocket from './userSocket';
const MSG_TYPES = {
    SELF_CONNECTED: 'SELF_CONNECTED',
    OTHER_CONNECTED: 'OTHER_CONNECTED',
    ICE_CANDIDATE: 'ICE_CANDIDATE',
    SDP_OFFER: 'SDP_OFFER',
    SDP_ANSWER: 'SDP_ANSWER',
    ROLE_DATA: 'ROLE_DATA'
}
class UserPeer {
    constructor({ url,iceServers }) {
        this.url = url;
        this._connect();
    }
    onSocketConnected() {}
    onDataReceived() {}
    onPeerConnected() {}
    onPeerDisconnected() {}
    async _connect() {
        this.stream = await this._getMediaStream();
        this.peerSets = {};
        // 建立websocket连接
        this.userSocket = new UserSocket(this.url);
        this.userSocket.onData = ::this._receiveData;
    }
    _receiveData(msg) {
        // console.log(msg);
        const { msg_type,content,userId } = msg;
        switch(msg_type) {
            case 'SELF_CONNECTED': {
                this._createPeersAndOffers(content.userDataList);
                this.onSocketConnected({ userId, roleData: content.roleData });
                // this.onSelfConnected({roleData: content.roleData,otherDataList: content.userDataList});
            }break; // 当我加入时，创建对其他人的连接，并发起offer，拿到socket分配的角色信息
            case 'OTHER_CONNECTED': {
                this._addPeer(userId, content.roleData);
                // this.onOtherConnected({userId,roleData:content.roleData});
            }break; // 有新人加入时，我收到通知，建立一条新连接
            case 'ICE_CANDIDATE': this._addCandidate(userId,content.icecandidate);break; // 当收到 userId用户 发来的candidate地址，设置
            case 'SDP_OFFER': this._answer(userId,content.offer);break; // 当收到 userId用户 发来的SDP offer时，回送SDP answer
            case 'SDP_ANSWER': this._receiveAnswer(userId,content.answer);break;
            case 'ROLE_DATA': this.onDataReceived({userId,roleData: content.roleData});break;
        }
    }
    _getMediaStream() {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });
    }
    _createPeersAndOffers(other_roleData_list) {
        const othersNumber = other_roleData_list.length;
        if (othersNumber < 1 || othersNumber > 4) return; //两个人在线上时才需要建立连接
        for (let i = 0; i < othersNumber; i++) { //n个人在线时，建立 n-1个连接
            const {userId,roleData} = other_roleData_list[i];

            this._addPeer(userId,roleData); // 创建对 userId用户 的连接
            this._offer(userId); // 发送对 userId用户 的offer
        }
    }
    _addPeer(userId,roleData) {
        const { stream,iceServers } = this;
        const peer = new RTCPeerConnection({ iceServers });
        peer.addEventListener('icecandidate',e => { //在stun查询到自己的ip外网地址时，发送给 userId用户
            if (!e.candidate) return
            const msg = {
                msg_type: MSG_TYPES.ICE_CANDIDATE,
                userId,
                content: {
                    icecandidate: e.candidate
                }
            };
            this.userSocket.send(msg);
          });
        peer.addStream(stream);
        peer.addEventListener('addstream', e => {
            this.onPeerConnected({
                userId,
                stream: e.stream,
                roleData
            });
        });
        peer.addEventListener('iceconnectionstatechange', e => {
            if(peer.iceConnectionState == 'disconnected') {
                console.log(userId + 'Disconnected');
                this.onPeerDisconnected({userId});
            }
        });
        this.peerSets[userId] = peer;
    }
    _addCandidate(userId,icecandidate) {
        try {
            const peer = this.peerSets[userId];
            peer.addIceCandidate(new RTCIceCandidate(icecandidate));
        } catch(err) {console.error(err); }
    }
    async _offer(userId) { // 我是请求方 发起offer并设置本身的SDP信息
        // const {peerSets,ws,state,userID} = this;
        const peer = this.peerSets[userId];
        const offer = await peer.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        });
        await peer.setLocalDescription(offer);
        const msg = {
            msg_type: MSG_TYPES.SDP_OFFER,
            userId,
            content: {
                offer
            }
        };
        this.userSocket.send(msg);
    }
    async _answer(userId,offer) { // 我是响应方 收到请求方offer后，设置对方的SDP信息，发起answer，设置本身的SDP信息
        // const {peer,ws,state,userID} = this;
        const peer = this.peerSets[userId];
        await peer.setRemoteDescription(offer);
        // this.state.remoteDescription = offer;

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        // this.state.localDescription = answer;

        const msg = {
            msg_type: MSG_TYPES.SDP_ANSWER,
            userId,
            content: { answer }
        };
        this.userSocket.send(msg);
    }
    async _receiveAnswer(userId,answer) { // 我是请求方 收到响应方answer后，设置对方的SDP信息
        // const {peer,ws,state} = this;
        const peer = this.peerSets[userId];
        await peer.setRemoteDescription(answer);
        // this.state.remoteDescription = answer;
    }
    sendRoleData(roleData) {
        const msg = {
            msg_type: MSG_TYPES.ROLE_DATA,
            content: {
                roleData
            }
        };
        this.userSocket.send(msg);
    }
}
export default UserPeer;