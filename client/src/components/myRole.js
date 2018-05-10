const {Object3D} = THREE;
import '@/lib/GLTFLoader';
const MODEL_PATH = 'model/robot/robot.gltf';
const HEAD_BONE_NAME = 'Armature_head_neck_lower';
class MyRole extends Object3D {
    constructor(camera) {
        super();
        this.camera = camera;
        this._loadModel();
        this.matrixAutoUpdate = false;
    }
    update() {
        const {camera,headBone,object3d} = this;
        if (!headBone || !camera || !object3d) return;
        this.headBone.rotation.set( camera.rotation.y,0,camera.rotation.x );
        // this.object3d.position.fromArray( camera.position );
        this.updateMatrix();
        this.visible = true;
    }
    async _loadModel() {
        return new Promise(resolve => {
            const loader = new THREE.GLTFLoader();
            loader.load(MODEL_PATH, data => {
                const object3d = data.scene;
                // object3d.position.set(0,-2,-5);//
                object3d.rotation.set(0,Math.PI,0);
                this.headBone = object3d.getObjectByName(HEAD_BONE_NAME); 
                debugger
                this.add(object3d);
                this.object3d = object3d;
                resolve(object3d);
            });
        });
    }
    
}
export default MyRole;