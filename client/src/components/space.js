/**
 * @author YoneChen / https://github.com/YoneChen
 */
const {Object3D} = THREE;
class Space extends Object3D {
    constructor({num,size,area,color}) {
        super();
		const universe_group = new THREE.Group();
		this.area = area;
		this.minArea = area / 2;
		this._area_half = area / 2;
		// this._minArea_half = minArea / 2;
        universe_group.add(this.createParticles(num,size,area,color));
        this.add(universe_group);
    }
	createParticles(num,size,area,color) { // 创建粒子系统
		let drawArc = () => {
			// 创建画布
			const canvas = document.createElement('canvas');
			canvas.width = 100;
			canvas.height = 100;
			const ctx = canvas.getContext('2d');
			// ctx.beginPath();
			// ctx.arc(50,50,50, 0 ,2*Math.PI,true);
			// ctx.fillStyle = color;
			// ctx.fill();
			// ctx.closePath();
			var radial = ctx.createRadialGradient(50,50,20,50,50,50);
			radial.addColorStop(0,color);
			radial.addColorStop(1,'rgba(255,255,255,0)');
			
			ctx.fillStyle = radial;
			ctx.fillRect(0,0,100,100);
			return canvas;
		};
		let texture = new THREE.CanvasTexture(drawArc());
		// texture.needsUpdate = true;
		let geometry = new THREE.Geometry();
		for (let i = 0; i < num; i ++ ) {
			let vertex = new THREE.Vector3(...this._randomVector);

			geometry.vertices.push( vertex );

		}
		this.material = new THREE.PointsMaterial( { size,map: texture ,sizeAttenuation:false, transparent: true } );
		let particles = new THREE.Points(geometry,this.material);
		return particles;
	}
	get _random() {
		return (Math.random() - 0.5) * this.area; 
	}
	get _randomVector() { 
		let x = this._random;
		let y = this._random;
		let z = this._random;
		const arr = [x,y,z];
		for(let i = 0; i < 3; i++) {
			if (Math.abs(arr[i]) > this.minArea) return arr;
		}
		const j = Math.floor(Math.random() * 3);
		const s = arr[j] > 0 ? 1 : -1;
		arr[j] = s * this.minArea + s * (this.area - this.minArea)/2 *arr[j]/this.minArea;
		return arr;
	}
	_checkRandom(x,y,z) {
		return Math.abs(val) < this.minArea/2;
	}
    // update() {

    // }
}
export default Space;
// THREE.DaydreamController = function () {

// 	THREE.Object3D.call( this );

// 	var scope = this;
// 	var gamepad;

// 	var axes = [ 0, 0 ];
// 	var touchpadIsPressed = false;
// 	var angularVelocity = new THREE.Vector3();

// 	this.matrixAutoUpdate = false;

// 	function findGamepad() {

// 		// iterate across gamepads as the Daydream Controller may not be
// 		// in position 0

// 		var gamepads = navigator.getGamepads && navigator.getGamepads();

// 		for ( var i = 0; i < 4; i ++ ) {

// 			var gamepad = gamepads[ i ];

// 			if ( gamepad && ( gamepad.id === 'Daydream Controller' ) ) {

// 				return gamepad;

// 			}

// 		}

// 	}

// 	this.getGamepad = function () {

// 		return gamepad;

// 	};

// 	this.getTouchPadState = function () {

// 		return touchpadIsPressed;

// 	};

// 	this.update = function () {

// 		gamepad = findGamepad();

// 		if ( gamepad !== undefined && gamepad.pose !== undefined ) {

// 			var pose = gamepad.pose;

// 			if ( pose === null ) return; // no user action yet

// 			//  orientation

// 			if ( pose.orientation !== null ) scope.quaternion.fromArray( pose.orientation );

// 			scope.updateMatrix();
// 			scope.visible = true;

// 			// angular velocity

// 			if ( pose.angularVelocity !== null && ! angularVelocity.equals( pose.angularVelocity ) ) {

// 				angularVelocity.fromArray( pose.angularVelocity );
// 				scope.dispatchEvent( { type: 'angularvelocitychanged', angularVelocity: angularVelocity } );

// 			}

// 			// axes (touchpad)

// 			if ( axes[ 0 ] !== gamepad.axes[ 0 ] || axes[ 1 ] !== gamepad.axes[ 1 ] ) {

// 				axes[ 0 ] = gamepad.axes[ 0 ];
// 				axes[ 1 ] = gamepad.axes[ 1 ];
// 				scope.dispatchEvent( { type: 'axischanged', axes: axes } );

// 			}

// 			// button (touchpad)

// 			if ( touchpadIsPressed !== gamepad.buttons[ 0 ].pressed ) {

// 				touchpadIsPressed = gamepad.buttons[ 0 ].pressed;
// 				scope.dispatchEvent( { type: touchpadIsPressed ? 'touchpaddown' : 'touchpadup' } );

// 			}

// 			// app button not available, reserved for use by the browser

// 		} else {

// 			scope.visible = false;

// 		}

// 	};

// };

// THREE.DaydreamController.prototype = Object.create( THREE.Object3D.prototype );
// THREE.DaydreamController.prototype.constructor = THREE.DaydreamController;
