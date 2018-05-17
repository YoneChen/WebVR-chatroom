

import '@/lib/GLTFLoader';
import '@/lib/OBJLoader';
import '@/lib/MTLLoader';
export async function getGLTFModel(path) {
    return new Promise(resolve => {
        const loader = new THREE.GLTFLoader();
        loader.load(path, data => {
            resolve(data);
        });
    });
}
export async function getOBJModel(OBJ_path,MTL_path) {
    return new Promise(resolve => {
        const mtlLoader = new THREE.MTLLoader();
        mtlLoader.load( MTL_path,  materials => {

            materials.preload();

            const objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.load( OBJ_path,  object => {
                debugger
                resolve(object);

            } );

        });
    });
}
