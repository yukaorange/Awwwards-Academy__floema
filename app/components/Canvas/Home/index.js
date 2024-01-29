import { Plane, Transform } from "ogl";
import map from "lodash/map";
import GSAP from "gsap";
import Media from "./Media";

export default class Home {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;

    this.sizes = sizes;

    this.group = new Transform();

    this.galleryElement = document.querySelector(".home__gallery");

    this.mediasElements = document.querySelectorAll(
      ".home__gallery__media__image"
    );

    this.createGeometry();
    this.createGallery();

    this.group.setParent(scene);

    this.x = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };

    this.y = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };

    this.scrollCurrent = {
      x: 0,
      y: 0,
    };

    this.scroll = {
      x: 0,
      y: 0,
    };
  }

  createGeometry() {
    this.geometry = new Plane(this.gl);
  }

  createGallery() {
    this.medias = map(this.mediasElements, (element, index) => {
      return new Media({
        element: element,
        gl: this.gl,
        geometry: this.geometry,
        index: index,
        scene: this.group,
        sizes: this.sizes,
      });
    });
  }

  /**
   * events
   */
  onResize(event) {
    this.galleryBounds = this.galleryElement.getBoundingClientRect(); //recomended.Not call this in Upadte.because it impact to performance.

    this.sizes = event.sizes;

    this.gallerySizes = {
      height:
        (this.galleryBounds.height / window.innerHeight) * this.sizes.height,
      width: (this.galleryBounds.width / window.innerWidth) * this.sizes.width,
    };
    //calculates the ratio of the gallery's width to the viewport's width.Multiplying this ratio by this.sizes.width then scales this ratio up to the size of the clip space. The result is the width of the gallery in the clip space.

    this.scroll.x = this.x.target = 0;
    this.scroll.y = this.y.target = 0;

    map(this.medias, (media) => {
      media.onResize(event, this.scroll);
    });
  }

  onTouchDown({ x, y }) {
    this.scrollCurrent.x = this.scroll.x;
    this.scrollCurrent.y = this.scroll.y;
  }

  onTouchMove({ x, y }) {
    const xDistance = x.start - x.end;
    const yDistance = y.start - y.end;

    this.x.target = this.scrollCurrent.x - xDistance;
    this.y.target = this.scrollCurrent.y - yDistance;
  }

  onTouchUp({ x, y }) {}

  onWheel({ pixelX, pixelY }) {
    this.x.target -= pixelX;
    this.y.target -= pixelY;
  }

  /**
   * update
   */
  update() {
    if (!this.galleryBounds) return;

    this.x.current = GSAP.utils.interpolate(
      this.x.current,
      this.x.target,
      this.x.lerp
    );

    this.y.current = GSAP.utils.interpolate(
      this.y.current,
      this.y.target,
      this.y.lerp
    );

    if (this.scroll.x < this.x.current) {
      this.x.direction = "right";
    } else if (this.scroll.x > this.x.current) {
      this.x.direction = "left";
    }

    if (this.scroll.y < this.y.current) {
      this.y.direction = "top";
    } else if (this.scroll.y > this.y.current) {
      this.y.direction = "bottom";
    }

    this.scroll.x = this.x.current;
    this.scroll.y = this.y.current;

    map(this.medias, (media, index) => {
      const scaleX = media.mesh.scale.x / 2;

      if (this.x.direction === "left") {
        const x = media.mesh.position.x + scaleX;

        if (x < -this.sizes.width / 2) {
          media.extra.x += this.gallerySizes.width;

          media.mesh.rotation.z = GSAP.utils.random(
            -Math.PI * 0.02,
            Math.PI * 0.02
          );
        }
      } else if (this.x.direction === "right") {
        const x = media.mesh.position.x - scaleX;

        if (x > this.sizes.width / 2) {
          media.extra.x -= this.gallerySizes.width;

          media.mesh.rotation.z = GSAP.utils.random(
            -Math.PI * 0.02,
            Math.PI * 0.02
          );
        }
      }

      const scaleY = media.mesh.scale.y / 2;

      if (this.y.direction === "top") {
        const y = media.mesh.position.y + scaleY;

        if (y < -this.sizes.height / 2) {
          media.extra.y += this.gallerySizes.height;

          media.mesh.rotation.z = GSAP.utils.random(
            -Math.PI * 0.02,
            Math.PI * 0.02
          );
        }
      } else if (this.y.direction === "bottom") {
        const y = media.mesh.position.y - scaleY;

        if (y > this.sizes.height / 2) {
          media.extra.y -= this.gallerySizes.height;

          media.mesh.rotation.z = GSAP.utils.random(
            -Math.PI * 0.02,
            Math.PI * 0.02
          );
        }
      }

      media.update(this.scroll);
    });
  }
}
