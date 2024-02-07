import { Mesh, Plane, Program, Texture } from "ogl";
import GSAP from "gsap";

import vertex from "shaders/plane-vertex.glsl";
import fragment from "shaders/plane-fragment.glsl";

export default class Transition {
  constructor({ collections, details, gl, scene, sizes, url }) {
    this.collections = collections;

    this.details = details;

    this.gl = gl;

    this.scene = scene;

    this.sizes = sizes;

    this.url = url;

    this.geometry = new Plane(this.gl);
  }

  createProgram(texture) {
    this.program = new Program(this.gl, {
      fragment: fragment,
      vertex: vertex,
      uniforms: {
        tMap: { value: texture },
        uAlpha: { value: 1 },
      },
    });
  }

  createMesh(mesh) {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });

    this.mesh.scale.x = mesh.scale.x;
    this.mesh.scale.y = mesh.scale.y;
    this.mesh.scale.z = mesh.scale.z;

    this.mesh.position.x = mesh.position.x;
    this.mesh.position.y = mesh.position.y;
    this.mesh.position.z = mesh.position.z;

    this.mesh.setParent(this.scene);
  }

  /**
   * element
   */
  setElement(element) {
    if (element.id === "collections") {
      const { index, medias } = element;

      const media = medias[index];

      this.createProgram(media.texture);

      this.createMesh(media.mesh);

      this.transition = "detail";
    } else {
      this.createProgram(element.texture);

      this.createMesh(element);

      this.transition = "collections";
    }
  }

  /**
   * Animations
   */

  animate(element, onComplete) {
    if (this.transition === "detail") {
      const timeline = GSAP.timeline({
        // delay: 0.5,
        onComplete: onComplete,
      });

      timeline.to(
        this.mesh.scale,
        {
          duration: 1.5,
          ease: "expo-inOut",
          x: element.scale.x,
          y: element.scale.y,
          z: element.scale.z,
        },
        0
      );

      timeline.to(
        this.mesh.position,
        {
          duration: 1.5,
          ease: "expo-inOut",
          x: element.position.x,
          y: element.position.y,
          z: element.position.z,
        },
        0
      );
    } else if (this.transition === "collections") {
    }
  }

  /**
   * events
   */

  /**
   * loop
   */
}
