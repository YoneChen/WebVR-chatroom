const {Object3D} = THREE;
import {getGLTFModel} from '@/utils/common';
const MODEL_ROBOT_PATH = 'model/robot/scene.gltf';
const MODEL_PLATFORM_PATH = 'model/platform/scene.gltf'
const HEAD_BONE_NAME = 'Armature_head_neck_lower';
class MyRole extends Object3D {
    constructor(camera) {
        super();
        this._roleInfo = {
            rotation: {x:0,y:0,z:0},
            position: {x:0,y:0,z:0}
        }
        this.camera = camera;
        this._init();
    }
    async _init() {
        return Promise.all([this._initRobot(),this._initPlatform()])
        .then(() => {
            this.group = new THREE.Group();
            this.group.add(this.robot);
            this.group.add(this.paltform);
            this.group.add(this.camera);
            this.add(this.group);
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
    onLoad(callback) {
        this._loaded = callback;
    }
    update() {
        const {camera,headBone,group} = this;
        if (!headBone || !camera || !group) return;
        const {rotation,position} = camera;
        this.roleInfo = {
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
            position: { x: position.x, y: position.y, z: position.z }
        }
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
}
export default MyRole;