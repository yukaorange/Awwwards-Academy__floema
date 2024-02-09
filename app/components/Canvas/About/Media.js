import { Mesh, Program } from "ogl";
import GSAP from "gsap";

import Detection from "classes/Detection";

import vertex from "shaders/plane-vertex.glsl";
import fragment from "shaders/plane-fragment.glsl";

export default class Media {
  constructor({ element, geometry, scene, gl, index, sizes }) {
    this.element = element;

    this.geometry = geometry;

    this.gl = gl;

    this.scene = scene;

    this.sizes = sizes;

    this.index = index;

    this.extra = 0;

    this.createTexture();
    this.createProgram();
    this.createMesh();

    this.createBounds({
      sizes: this.sizes,
    });
  }

  createTexture() {
    const image = this.element.querySelector("img");

    this.texture = window.TEXTURES[image.getAttribute("data-src")];
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
    GSAP.fromTo(
      this.program.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
      }
    );
  }
  hide() {
    GSAP.to(this.program.uniforms.uAlpha, {
      value: 0,
    });
  }

  /**
   * events
   */
  onResize(sizes, scroll) {
    this.extra = 0;

    this.createBounds(sizes);

    this.updateX(scroll);
    this.updateY(0);
  }

  /**
   * loop
   */
  updateRotation() {
    this.mesh.rotation.z = GSAP.utils.mapRange(
      -this.sizes.width / 2,
      this.sizes.width / 2,
      Math.PI * 0.1,
      -Math.PI * 0.1,
      this.mesh.position.x
    );
  }

  updateScale() {
    this.height = this.bounds.height / window.innerHeight;
    this.width = this.bounds.width / window.innerWidth;

    this.mesh.scale.x = this.sizes.width * this.width;
    this.mesh.scale.y = this.sizes.height * this.height;

    const scale = GSAP.utils.mapRange(
      0,
      this.sizes.width / 2,
      0.01,
      0.0,
      Math.abs(this.mesh.position.x)
    );

    this.mesh.scale.x += scale;

    this.mesh.scale.y += scale;
  }

  updateX(x = 0) {
    this.x = (this.bounds.left + x) / window.innerWidth;

    this.mesh.position.x =
      -this.sizes.width / 2 +
      this.mesh.scale.x / 2 +
      this.x * this.sizes.width +
      this.extra;
  }

  updateY(y = 0) {
    this.y = (this.bounds.top + y) / window.innerHeight;

    this.mesh.position.y =
      this.sizes.height / 2 -
      this.mesh.scale.y / 2 -
      this.y * this.sizes.height;

    const extra = Detection.isPhone() ? 15 : 40;

    this.mesh.position.y +=
      Math.cos((this.mesh.position.x / this.sizes.width) * Math.PI * 0.1) *
        extra -
      extra;

    // Add additional Y to the mesh position.along with scaling.
    const additionalY = GSAP.utils.mapRange(
      0,
      this.sizes.width / 2,
      0.1,
      0.0,
      Math.abs(this.mesh.position.x)
    );
    this.mesh.position.y += additionalY;
  }

  update(scroll) {
    // if (!this.bounds) return; //caz this.update method is ganna be called before finishing createBounds method.

    this.updateRotation();
    this.updateScale();
    this.updateX(scroll);
    this.updateY(0);
  }
}
