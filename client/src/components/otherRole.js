const {Object3D} = THREE;
import '@/lib/GLTFLoader';
const MODEL_PATH = 'model/robot/robot.gltf';
const HEAD_BONE_NAME = 'Armature_head_neck_lower';
class OtherRole extends Object3D {
    constructor() {
        super();
        this._loadModel();
    }
    setTransforms({rotation,position}) {
            const { headBone,object3d } = this;
            if (!headBone || !object3d) return;
            this.headBone.rotation.set( rotation );
            this.object3d.position.set( position );
            // this.updateMatrix();
    }
    // update() {
    //     const {camera,headBone,object3d} = this;
    //     if (!headBone || !camera || !object3d) return;
    //     this.headBone.quaternion.fromArray( camera.quaternion );
    //     this.object3d.position.fromArray( camera.position );
    //     this.updateMatrix();
    // }
    async _loadModel() {
        return new Promise(resolve => {
            const loader = new THREE.GLTFLoader();
            loader.load(MODEL_PATH, data => {
                const object3d = data.scene;
                this.headBone = object3d.getObjectByName(HEAD_BONE_NAME); 
                this.add(object3d);
                // object3d.position.set(0,-4,-2);
                // object3d.position.set(0,0,-12);
                this.object3d = object3d;
                // object3d.rotation.set(0,Math.PI,0);
                // role.position.set(position.x,position.y,position.z);
                // headBone.rotation.set(rotation.x,rotation.y,rotation.z);
                resolve(object3d);
            });
        });
    }
}
export default OtherRole;