import { Mesh, Program, Texture } from "ogl";
import GSAP from "gsap";

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

    this.createTexture();
    this.createProgram();
    this.createMesh();

    this.extra = {
      x: 0,
      y: 0,
    };
  }

  createTexture() {
    this.texture = new Texture(this.gl);

    const image = this.element.querySelector("img");

    this.image = new window.Image();

    this.image.crossOrigin = "anonymous";

    this.image.src = image.getAttribute("data-src");

    this.image.onload = (_) => {
      this.texture.image = this.image;
    };
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
    this.extra = {
      x: 0,
      y: 0,
    };

    this.createBounds(sizes);

    this.updateX(scroll && scroll.x);
    this.updateY(scroll && scroll.y);
  }

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

  updateX(x = 0) {
    this.x = (this.bounds.left + x) / window.innerWidth;

    this.mesh.position.x =
      -this.sizes.width / 2 +
      this.mesh.scale.x / 2 +
      this.x * this.sizes.width +
      this.extra.x;
  }

  updateY(y = 0) {
    this.y = (this.bounds.top + y) / window.innerHeight;

    this.mesh.position.y =
      this.sizes.height / 2 -
      this.mesh.scale.y / 2 -
      this.y * this.sizes.height +
      this.extra.y;

    this.mesh.position.y +=
      Math.sin((this.mesh.position.x / this.sizes.width) * Math.PI * 2) * 0.1;
  }

  update(scroll) {
    if (!this.bounds) return; //caz this.update method is ganna be called before finishing createBounds method.

    this.updateScale();
    this.updateX(scroll);
    this.updateY(0);
  }
}
