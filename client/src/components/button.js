const {Object3D} = THREE;
class Button extends Object3D {
    constructor(options) {
        super();
        this._init(options);
    }
    onFocus() {}
    onBlur() {}
    onSelect() {}
    _init(options) {
        const option = {
            camera: WebVR.Camera,
            width: 10,
            height: 7.5,
            fontSize: 4,
            fontColor: '#00aadd',
            backgroundColor: '#333333',
            text: 'button',
            ...options
        };
        const button = this.createButton(option);
        this.add(button);
        const pointer = this.createPoint();
        WebVR.Gazer.on(button, 'gazeEnter', ({point}) => {
            WebVR.Scene.add(pointer);
            this.onFocus();
            WebVR.CrossHair.animate.loader.start();
        });
        WebVR.Gazer.on(button, 'gazeTrigger', ({point}) => {
            const z = point.z > 0 ? point.z - 0.01 : point.z + 0.01;
            pointer.position.set(point.x,point.y,z)
        });
        WebVR.Gazer.on(button, 'gazeLeave', ({point}) => {
            WebVR.Scene.remove(pointer);
            WebVR.CrossHair.animate.loader.stop();
            this.onBlur();
        });
        WebVR.Gazer.on(button, 'gazeWait', ({point}) => {
            WebVR.CrossHair.animate.loader.stop();
            this.onSelect();
        });
    }
    createButton(option) {

        const geometry = new THREE.PlaneGeometry(option.width, option.height);
        const texture = this.getTexture(option);
        const material = new THREE.MeshBasicMaterial({ map: texture, opacity: 0.75, transparent: true });
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }
    createPoint() {
        const geometry = new THREE.CircleGeometry(0.05, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.8,
            transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }
    getTexture({
        text, 
        backgroundColor,
        fontSize,
        fontColor,
        width,
        height
    }) {
        let canvas = document.createElement('canvas');
        const _width =  width * 100, _height =  height * 100;
        canvas.width =_width, canvas.height = _height;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, _width, _height);
        ctx.fillStyle = fontColor;
        ctx.font = `${fontSize * 100}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, _width / 2, _height / 2);
        let texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
}
export default Button;