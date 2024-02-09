import { Mesh, Program, Plane } from "ogl";
import GSAP from "gsap";

import vertex from "shaders/plane-vertex.glsl";
import fragment from "shaders/plane-fragment.glsl";

export default class Detail {
  constructor({ scene, gl, sizes, transition }) {
    this.id = "detail";

    this.element = document.querySelector(".detail__media__image");

    this.gl = gl;

    this.geometry = new Plane(this.gl);

    this.scene = scene;

    this.sizes = sizes;

    this.transition = transition;

    this.createTexture();
    this.createProgram();
    this.createMesh();

    this.createBounds({ sizes: this.sizes });

    this.show();
  }

  createTexture() {
    const image = this.element.getAttribute("data-src");

    this.texture = window.TEXTURES[image];
  }

  createProgram() {
    this.program = new Program(this.gl, {
      fragment: fragment,
      vertex: vertex,
      uniforms: {
        tMap: { value: this.texture },
        uAlpha: { value: 0 },
      },
    });
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });

    this.mesh.setParent(this.scene);
  }

  createBounds({ sizes }) {
    this.sizes = sizes;
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();
  }

  /**
   * Animations
   */
  show() {
    if (this.transition) {
      this.transition.animate(this.mesh, (_) => {
        this.program.uniforms.uAlpha.value = 1;
      });
    } else {
      GSAP.to(this.program.uniforms.uAlpha, {
        value: 1,
      });
    }
  }

  hide() {}
  /**
   * events
   */
  onResize(sizes) {
    this.createBounds(sizes);

    this.updateX();
    this.updateY();
  }

  onTouchDown() {}

  onTouchMove() {}

  onTouchUp() {}

  /**
   * loop
   */

  updateScale() {
    this.height = this.bounds.height / window.innerHeight;
    this.width = this.bounds.width / window.innerWidth;

    this.mesh.scale.x = this.sizes.width * this.width;
    this.mesh.scale.y = this.sizes.height * this.height;

    const scale = GSAP.utils.mapRange(
      0,
      this.sizes.width / 2,
      0.0,
      0.0,
      Math.abs(this.mesh.position.x)
    );

    this.mesh.scale.x += scale;
    this.mesh.scale.y += scale;
  }

  updateX() {
    this.x = this.bounds.left / window.innerWidth;

    this.mesh.position.x =
      -this.sizes.width / 2 + this.mesh.scale.x / 2 + this.x * this.sizes.width;
  }

  updateY() {
    this.y = this.bounds.top / window.innerHeight;

    this.mesh.position.y =
      this.sizes.height / 2 -
      this.mesh.scale.y / 2 -
      this.y * this.sizes.height;

    this.mesh.position.y +=
      Math.sin((this.mesh.position.x / this.sizes.width) * Math.PI * 2) * 0.1;
  }

  update() {
    // if (!this.bounds) return; //caz this.update method is ganna be called before finishing createBounds method.

    this.updateX();
    this.updateY();
  }

  /**
   * destroy
   */
  destroy() {
    this.scene.removeChild(this.mesh);
  }
}
