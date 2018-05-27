const {Object3D} = THREE;
import {getGLTFModel,getTexture} from '@/utils/common';
const MODEL_ROBOT_PATH = 'model/robot/scene.gltf';
const MODEL_PLATFORM_PATH = 'model/platform/scene.gltf'
const HEAD_BONE_NAME = 'Armature_head_neck_lower';
class OtherRole extends Object3D {
    constructor() {
        super();
        this.name = '';
        this._isLoaded = false;
        this._roleInfo = {
            rotation: {x:0,y:0,z:0},
            position: {x:0,y:0,z:0}
        }
        this._init();
    }
    async _init() {
        return Promise.all([this._initRobot(),this._initPlatform()])
        .then(() => {
            const nameText = this._initRoleNameText();
            this.group = new THREE.Group();
            this.group.add(this.robot);
            this.group.add(this.paltform);
            this.group.add(nameText);
            this.add(this.group);
            this._isLoaded = true;
            if (this.audioStream) this._addAudio(this.audioStream);
            this._loaded();
        });
    }
    _loaded() {}
    async _initRobot() {
        const {scene: model} = await getGLTFModel(MODEL_ROBOT_PATH);
        model.rotation.set(0,Math.PI,0);
        model.scale.set(5,5,5);        
        model.position.set(0,-15,3);
        this.headBone = model.getObjectByName(HEAD_BONE_NAME); 
        this.robot = model;
    }
    async _initPlatform() {
        const {scene: model} = await getGLTFModel(MODEL_PLATFORM_PATH);
        model.scale.set(0.01,0.01,0.01);
        model.position.set(0,-17,3);
        this.paltform = model;
    }
    _initRoleNameText() {
        const {name} = this;
		const texture = getTexture({
            width: 8,
            height: 8,
            fontSize: 1,
            text: name,
            fontColor: "#fff",
            backgroundColor: "rgba(0,0,0,0)"
        });
		// texture.needsUpdate = true;
		const geometry = new THREE.Geometry();
        const vertex = new THREE.Vector3(0,4,3);

        geometry.vertices.push( vertex );
		const material = new THREE.PointsMaterial( { size: 100,map: texture ,sizeAttenuation:false, transparent: true } );
        const mesh = new THREE.Points(geometry,material);
        return mesh;
    }
    _addAudio(stream) { // 加入声音
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
        this.headBone.add(sound);
        // const role = this.roleSet[userId];
        // // finally add the sound to the mesh
        // role.add( sound );
        
        // this.roleSet[userId].speaker = new Speaker(audioCtx,stream);
    }
    onLoad(callback) {
        this._loaded = callback;
    }
    update() {
        const {headBone,group} = this;
        if (!headBone || !group) return;
        this._updateModel();
    }
    _updateModel() {
        const {position,rotation} = this.roleInfo;
        this.headBone.rotation.set( rotation.y,0,rotation.x );
        this.group.rotation.set(0,rotation.y,0);
        this.group.position.set(position.x,position.y,position.z);
        // this.object3d.position.fromArray( camera.position );
        this.updateMatrix();
        this.visible = true;
    }
    set roleInfo(val) {
        this._roleInfo = val;
    }
    get roleInfo() {
        return this._roleInfo
    }
    set audioStream(val) {
        this._stream = val;
        if (this._isLoaded) this._addAudio(this._stream);
    }
    get audioStream() {
        return this._stream;
    }
}
export default OtherRole;