/*global THREE:true*/
/*global WebVR:true*/
import VRPage from '@/core/js/VRPage';
import UserRTC from '@/utils/rtc';
import {Listener,Speaker} from '@/utils/audio';
import {MyRole,OtherRole,Space,Spaceship,Spacestation,Galaxy,Planet,Button} from '@/components';
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
        const { MODEL_ROBOT } = this.assets;
        const exitButton = new Button({text: 'Exit'});
        exitButton.position.set(0,0,-10);
        WebVR.Scene.add(exitButton);
        this.addSpace();
        // this.addPlatform();
        // this.addSpaceShip();
        this.addSpaceStation();
        // this.addGalaxy();
        // this.addPlanet();
        // this.addButton({
        //     index: -1,
        //     text: 'Exit',
        //     callback: () => {
        //         WebVR.Router.back();
        //     }
        // });
        this.addDirectLight();
        const url = 'ws://127.0.0.1:8086';
        this.userRtc = new UserRTC({
            url,
            IJoin: this.addRoles.bind(this),
            otherJoin: this.addOtherRole.bind(this),
            receiveRoleInfo: this.updateOtherRole.bind(this),
            peerConnected: this.addRoleAudio.bind(this),
            peerDisconnected: this.removeOtherRole.bind(this)
        });
        // this.audioCtx = new AudioContext();
        // this.listener = new Listener(this.audioCtx);
    }
    loaded() {
        // play the sound
        //  this.envSound.play();
    }
    async addRoles({roleData,otherDataList}) {
        this.addMyRole(roleData);
        otherDataList.forEach(({userId,roleData}) => {
            this.addOtherRole({userId,roleData});
        });
    }
    addMyRole(roleData) {
        this.me = new MyRole(WebVR.Camera);
        // this.me.add(WebVR.Camera)
        this.initRole(this.me,roleData);
    }
    addOtherRole({userId,roleData}) {
        const role = new OtherRole();
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
    addPlatform() {
        const platform = new Platform();
        platform.position.set(0,-10,0);
        WebVR.Scene.add(platform);
    }
    addSpaceShip() {
        const {MODEL_SPACESHIP1,MODEL_SPACESHIP2} = this.assets;
        const spaceship1 = new Spaceship(MODEL_SPACESHIP1);
        spaceship1.onLoad(() => {
            spaceship1.animations.fly({ x: -2000, y: 300, z: -200 },{ x: 2000, y: 300, z: -200 },20000);
        });
        WebVR.Scene.add(spaceship1);
        const spaceship2 = new Spaceship(MODEL_SPACESHIP2);
        spaceship2.scale.set(20,20,20);
        spaceship2.onLoad(() => {
            spaceship2.animations.fly({ x: 2000, y: -200, z: -200 },{ x: -2000, y: -200, z: 200 },50000);
        });
        WebVR.Scene.add(spaceship2);
    }
    addSpaceStation() {
        const spacestation = new Spacestation();
        spacestation.position.set(120,-50, 150);
        spacestation.onLoad(() => {
            spacestation.animations.rotate(10000);
        });
        WebVR.Scene.add(spacestation);
    }
    addGalaxy() {
        const galaxy = new Galaxy();
        galaxy.position.set(0,1000,0);
        galaxy.rotation.set(-Math.PI/4,0,0);
        galaxy.animations.rotate(60000);
        WebVR.Scene.add(galaxy);
    }
    addPlanet() {
        const planet = new Planet();
        planet.position.set(1000,500,80);
        planet.animations.rotate(50000);
        WebVR.Scene.add(planet);
    }
    updateOtherRole({userId,roleData}) {
        const {model,speaker} = this.roleSet[userId];
        if (!model) return;
        const {position,rotation} = roleData;
        model.setTransforms({
            position,
            rotation
        });
        if(speaker) speaker.update(roleData.position);
    }
    removeOtherRole(userId) {
        const {model} = this.roleSet[userId];
        if (!model) return;
        WebVR.Scene.remove(model);
        delete this.roleSet[userId];
    }
    addPanorama(radius, path) {
        // create panorama
        const geometry = new THREE.SphereGeometry(radius, 50, 50);
        const material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(path), side: THREE.BackSide });
        const panorama = new THREE.Mesh(geometry, material);
        WebVR.Scene.add(panorama);
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
    addButton({ text, index, fontSize = 64, callback = () => { } }) {
        const option = {
            hover: 5,
            camera: WebVR.Camera,
            radius: 25,
            angle: Math.PI / 6 * index,
            width: 10,
            height: 7.5
        };
        let hx = option.hover * Math.sin(option.angle), hz = option.hover * Math.cos(option.angle);
        let geometry = new THREE.PlaneGeometry(option.width, option.height);
        let material = new THREE.MeshBasicMaterial({ map: this.getTexture(text, 32), opacity: 0.75, transparent: true });
        let button = new THREE.Mesh(geometry, material);
        let cx = option.camera.position.x,
            cy = option.camera.position.y,
            cz = option.camera.position.z;
        let dx = option.radius * Math.sin(option.angle),
            dz = option.radius * Math.cos(option.angle);
        button.position.set(cx + dx, cy, cz - dz);
        button.rotation.y = -option.angle;

        WebVR.Scene.add(button);
        WebVR.Gazer.on(button, 'gazeEnter', m => {
            button.scale.set(1.2, 1.2, 1.2);
            WebVR.CrossHair.animate.loader.start();
        });
        WebVR.Gazer.on(button, 'gazeLeave', m => {
            button.scale.set(1, 1, 1);
            WebVR.CrossHair.animate.loader.stop();
        });
        WebVR.Gazer.on(button, 'gazeWait', m => {
            WebVR.CrossHair.animate.loader.stop();
            callback();
        });
    }
    addRoleAudio({userId,stream}) { // 加入声音
        const {audioCtx} = this;
        // // create the PositionalAudio object (passing in the listener)
        var sound = new THREE.PositionalAudio( WebVR.AudioListener );
        // // const audioCtx = THREE.AudioContext.getContext();
        // var url = URL.createObjectURL(stream);
        // var audio = new Audio(url);
        // // audio.autoplay = true;
        const source = sound.context.createMediaStreamSource(stream);
        // // load a sound and set it as the PositionalAudio object's buffer
        sound.setNodeSource(source);
        sound.autoplay = true;
        // const role = this.roleSet[userId];
        // // finally add the sound to the mesh
        // role.add( sound );
        
        // this.roleSet[userId].speaker = new Speaker(audioCtx,stream);
    }
    sendMyRoleInfo() { // 更新自己的角色行为
        if (!this.myRole) return;
        this.userRtc.sendRoleInfo({
            rotation: { x: role.rotation.x, y: role.rotation.y, z: role.rotation.z },
            position: { x: role.position.x, y: role.position.y, z: role.position.z },
        });
        // this.listener.update(role.position,role.quaternion);
    }
    update() {
        if(this.me) {
            this.sendMyRoleInfo();
            this.me.update();
        }
        // if(this.ball)this.ball.rotation.set(WebVR.Camera.rotation.x,WebVR.Camera.rotation.y,WebVR.Camera.rotation.z);
    }
}
export default Chatroom;