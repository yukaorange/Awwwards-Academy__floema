import { Camera, Renderer, Transform } from "ogl";

import Home from "./Home";

export default class Canvas {
  constructor() {
    this.x = {
      start: 0,
      end: 0,
    };

    this.y = {
      start: 0,
      end: 0,
    };

    this.createRenderer();
    this.createScene();
    this.createCamera();

    this.onResize();

    this.createHome();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
    });

    this.gl = this.renderer.gl;

    document.body.appendChild(this.gl.canvas);
  }

  createScene() {
    this.scene = new Transform();
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.position.z = 5;
  }

  createHome() {
    this.home = new Home({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
    });
  }

  /**
   * events
   */

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight); //expand canvas to full screen.

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });

    const fov = this.camera.fov * (Math.PI / 180); // default camera.fov = 45deg. result fov is in radians. (1/4 PI rad)

    const height = 2 * Math.tan(fov / 2) * this.camera.position.z; //z = 5

    const width = height * this.camera.aspect; //To fit clip space to screen.

    this.sizes = {
      //Calclated clip space sizes.
      height: height,
      width: width,
    };

    if (this.home) {
      this.home.onResize({
        sizes: this.sizes,
      });
    }
  }

  onTouchDown(event) {
    this.isDown = true;

    this.x.start = event.touches ? event.touches[0].clientX : event.clientX;
    this.y.start = event.touches ? event.touches[0].clientY : event.clientY;

    if (this.home) {
      this.home.onTouchDown({
        x: this.x,
        y: this.y,
      });
    }
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;

    this.x.end = x;
    this.y.end = y;

    if (this.home) {
      this.home.onTouchMove({
        x: this.x,
        y: this.y,
      });
    }
  }

  onTouchUp(event) {
    this.isDown = false;

    const x = event.changedTouches
      ? event.changedTouches[0].clientX
      : event.clientX;
    const y = event.changedTouches
      ? event.changedTouches[0].clientY
      : event.clientY;

    this.x.end = x;
    this.y.end = y;

    if (this.home) {
      this.home.onTouchUp({
        x: this.x,
        y: this.y,
      });
    }
  }

  onWheel({ pixelX, pixelY }) {
    if(this.home){
      this.home.onWheel({ pixelX, pixelY });
    }
  }

  /**loop */
  update() {
    if (this.home) {
      this.home.update();
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
  }
}
