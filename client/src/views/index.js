/*global THREE:true*/
/*global WebVR:true*/
import VRPage from '@/core/js/VRPage';
import UserPeer from '@/utils/userPeer';
import {MyRole,OtherRole,Space,Button} from '@/components';
import '@/lib/GLTFLoader';
class Chatroom extends VRPage {
    assets() {
        return {
            MODEL_ROBOT: 'model/robot/robot.gltf',
            MODEL_ROOM: 'model/medieval_castle_with_village/scene.gltf',
            MODEL_SPACESHIP1: 'model/spaceship1/scene.gltf',
            MODEL_SPACESHIP2: 'model/spaceship2/scene.gltf'
            // TEXTURE_SKYBOX: 'texture/360bg.jpg'
        };
    }
    start() {
        this.roleSet = {};
        this.otherDataList = [];
        const { MODEL_ROBOT } = this.assets;
        const exitButton = new Button({text: 'Exit', fontSize: 2, width: 5, height: 3});
        exitButton.position.set(0,0,-15);
        WebVR.Scene.add(exitButton);
        this.addSpace();
        // this.addPlatform();
        // this.addSpaceShip();
        // this.addSpaceStation();
        // this.addGalaxy();
        // this.addPlanet();
        this.addDirectLight();
        const url = 'ws://127.0.0.1:8086';
        this.userPeer = new UserPeer({
            url,
            IJoin: this.addAllRoles.bind(this),
            otherJoin: this.addOtherRole.bind(this),
            receiveRoleInfo: this.receiveRoleInfo.bind(this),
            peerConnected: this.audioLoaded.bind(this),
            peerDisconnected: this.removeOtherRole.bind(this)
        });
    }
    loaded() {
        // play the sound
        //  this.envSound.play();
    }
    addAllRoles({roleData,otherDataList}) { // 添加角色
        this.addMyRole(roleData);
        this.addOtherRoles(otherDataList)
    }
    addMyRole(roleData) {
        this.me = new MyRole(WebVR.Camera);
        // this.me.add(WebVR.Camera)
        this.initRole(this.me,roleData);
    }
    addOtherRoles(otherDataList) {
        otherDataList.forEach(({userId,roleData}) => {
            this.addOtherRole({userId,roleData});
        });
    }
    addOtherRole({userId,roleData}) {
        const role = new OtherRole();
        role.name = userId;
        this.initRole(role,roleData);
        this.roleSet[userId] = { model: role };
    }
    initRole(role,{position,rotation}) {
        role.position.set(position.x,position.y,position.z);
        role.rotation.set(rotation.x,rotation.y,rotation.z);
        WebVR.Scene.add(role);
    }
    addSpace() {
        const stars1 = new Space({
            num: 6000,
            area: 4000,
            size: 1.5,
            color: "#ffffff"
        });
        const stars2 = new Space({
            num: 5000,
            area: 3000,
            size: 1.8,
            color: "#D3D793"
        });
        const stars3 = new Space({
            num: 2000,
            area: 5000,
            size: 2.2,
            color: "#D3D793"
        });
        WebVR.Scene.add(stars1);
        WebVR.Scene.add(stars2);
        WebVR.Scene.add(stars3);
    }
    updateAllRoles() {
        this.updateMyRole();
        this.updateOtherRoles();
    }
    updateMyRole() {
        if(!this.me) return;
        this.me.update();
        this.sendMyRoleInfo();
    }
    updateOtherRoles() {
        Object.keys(this.roleSet).forEach(userid => {
            const {model} = this.roleSet[userid];
            model.update();
        })
    }
    receiveRoleInfo({userId,roleData}) {
        const {model} = this.roleSet[userId];
        if (!model) return;
        model.roleInfo = roleData;
        // if(speaker) speaker.update(roleData.position);
    }
    removeOtherRole(userId) {
        const {model} = this.roleSet[userId];
        if (!model) return;
        WebVR.Scene.remove(model);
        delete this.roleSet[userId];
    }
    addEnvAudio(path) {
        // instantiate audio object
        this.envSound = new THREE.Audio(WebVR.AudioListener);

        // add the audio object to the scene
        WebVR.Scene.add(this.envSound);
        // instantiate a loader
        const loader = new THREE.AudioLoader();

        // load a resource
        loader.load(
            // resource URL
            path,
            // Function when resource is loaded
            audioBuffer => {
                // set the audio object buffer to the loaded object
                this.envSound.setBuffer(audioBuffer);
                this.envSound.setLoop(true);
            }
        );
    }
    addDirectLight() {
        // create the enviromental light
        WebVR.Scene.add(new THREE.AmbientLight(0xeeeeee));
        let light = new THREE.DirectionalLight(0xffffff, 0.75);
        light.position.set(50, 50, -50);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 10;
        light.shadow.camera.far = 500;
        WebVR.Scene.add(light);
    }
    audioLoaded({userId,stream}) {
        const {model} = this.roleSet[userId];
        model.audioStream = stream;
    }
    sendMyRoleInfo() { // 发送自己的角色行为
        console.log(this.me.roleInfo)
        this.userRtc.sendRoleInfo(this.me.roleInfo);
        // this.listener.update(role.position,role.quaternion);
    }
    update() {
        this.updateAllRoles();
        // if(this.ball)this.ball.rotation.set(WebVR.Camera.rotation.x,WebVR.Camera.rotation.y,WebVR.Camera.rotation.z);
    }
}
export default Chatroom;