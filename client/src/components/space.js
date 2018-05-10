/**
 * @author YoneChen / https://github.com/YoneChen
 */
const {Object3D} = THREE;
class Space extends Object3D {
    constructor({num,size,area}) {
        super();
        const universe_group = new THREE.Group();
        universe_group.add(this.createParticles(num,size,area));
        this.add(universe_group);
    }
	createParticles(num,size,area) { // 创建粒子系统
		let drawArc = () => {
			// 创建画布
			const canvas = document.createElement('canvas');
			canvas.width	= 100;
			canvas.height	= 100;
			const ctx = canvas.getContext('2d');
			ctx.beginPath();
			ctx.arc(50,50,50, 0 ,2*Math.PI,true);
			ctx.fillStyle = "#ffffff";
			ctx.fill();
			return canvas;
		};
		let texture = new THREE.Texture(drawArc());
		// texture.needsUpdate = true;
		let geometry = new THREE.Geometry();
		for (let i = 0; i < num; i ++ ) {

			let vertex = new THREE.Vector3();
			vertex.x = Math.random() * area - area/2;
			vertex.y = Math.random() * area - area/2;
			vertex.z = Math.random() * area - area/2;

			geometry.vertices.push( vertex );

		}
		this.material = new THREE.PointsMaterial( { size: size,color: 0xffffff ,sizeAttenuation:false, transparent: true } );
		let particles = new THREE.Points(geometry,this.material);
		return particles;
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
