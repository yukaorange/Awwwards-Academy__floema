import GSAP from "gsap";
import { Camera, Renderer, Transform } from "ogl";

import Home from "./Home";
import About from "./About";
import Collections from "./Collections";
import Detail from "./Detail";
import Transition from "./Transition";

export default class Canvas {
  constructor({ template }) {
    this.template = template;

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

  /**
   * home
   */
  createHome() {
    this.home = new Home({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
    });
  }

  destroyHome() {
    if (!this.home) return;
    this.home.destroy();
    this.home = null;
  }

  /**
   * about
   */
  createAbout() {
    this.about = new About({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
    });
  }

  destroyAbout() {
    if (!this.about) return;
    this.about.destroy();
    this.about = null;
  }

  /**
   * collections
   */
  createCollections() {
    this.collections = new Collections({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
      transition: this.transition,
    });
  }

  destroyCollections() {
    if (!this.collections) return;
    this.collections.destroy();
    this.collections = null;
  }

  /**
   * collections
   */
  createDetail() {
    this.detail = new Detail({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
      transition: this.transition,
    });
  }

  destroyDetail() {
    if (!this.detail) return;
    this.detail.destroy();
    this.detail = null;
  }

  /**
   * events
   */

  onPreloaded() {
    this.onChangeEnd(this.template);
  }

  onChangeStart(template, url) {
    this.template = template;

    if (this.home) {
      this.home.hide();
    }

    if (this.collections) {
      this.collections.hide();
    }

    if (this.detail) {
      this.detail.hide();
    }

    if (this.about) {
      this.about.hide();
    }

    this.isFromCollectionToDetail =
      this.template === "collections" && url.indexOf("detail") > -1; //checking clicked url is from collection.

    this.isFromDetailToCollection =
      this.template === "detail" && url.indexOf("collections") > -1; //checking returning from detail.

    if (this.isFromCollectionToDetail || this.isFromDetailToCollection) {
      this.transition = new Transition({
        gl: this.gl,
        scene: this.scene,
        sizes: this.sizes,
        url: url,
      });

      this.transition.setElement(this.collections || this.detail);
    }
  }

  onChangeEnd(template) {
    if (template == "home") {
      if (this.home) {
        this.destroyHome();
      }
      this.createHome();
    } else {
      this.destroyHome();
    }

    if (template == "collections") {
      this.createCollections();
    } else {
      this.destroyCollections();
    }

    if (template == "detail") {
      this.createDetail();
    } else {
      this.destroyDetail();
    }

    if (template == "about") {
      this.createAbout();
    } else {
      this.destroyAbout();
    }
  }

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

    const values = {
      sizes: this.sizes,
    };

    if (this.home) {
      this.home.onResize(values);
    }

    if (this.collections) {
      this.collections.onResize(values);
    }

    if (this.detail) {
      this.detail.onResize(values);
    }

    if (this.about) {
      this.about.onResize(values);
    }
  }

  onTouchDown(event) {
    this.isDown = true;

    this.x.start = event.touches ? event.touches[0].clientX : event.clientX;
    this.y.start = event.touches ? event.touches[0].clientY : event.clientY;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.about) {
      this.about.onTouchDown(values);
    }

    if (this.collections) {
      this.collections.onTouchDown(values);
    }

    if (this.detail) {
      this.detail.onTouchDown(values);
    }

    if (this.home) {
      this.home.onTouchDown(values);
    }
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;

    this.x.end = x;
    this.y.end = y;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.about) {
      this.about.onTouchMove(values);
    }

    if (this.collections) {
      this.collections.onTouchMove(values);
    }

    if (this.detail) {
      this.detail.onTouchMove(values);
    }

    if (this.home) {
      this.home.onTouchMove(values);
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

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.about) {
      this.about.onTouchUp(values);
    }

    if (this.collections) {
      this.collections.onTouchUp(values);
    }

    if (this.detail) {
      this.detail.onTouchUp(values);
    }

    if (this.home) {
      this.home.onTouchUp(values);
    }
  }

  onWheel({ pixelX, pixelY }) {
    if (this.collections) {
      this.collections.onWheel({ pixelX, pixelY });
    }

    if (this.home) {
      this.home.onWheel({ pixelX, pixelY });
    }
  }

  /**loop */
  update(scroll) {
    if (this.home) {
      this.home.update();
    }

    if (this.collections) {
      this.collections.update();
    }

    if (this.detail) {
      this.detail.update();
    }

    if (this.about) {
      this.about.update(scroll);
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
  }
}
