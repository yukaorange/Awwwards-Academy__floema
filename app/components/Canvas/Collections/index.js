import { Plane, Transform } from "ogl";
import map from "lodash/map";
import GSAP from "gsap";
import Media from "./Media";
import prefix from "prefix";

export default class Collections {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;

    this.prefixTransform = prefix("transform");

    this.group = new Transform();

    this.galleryElement = document.querySelector(".collections__gallery");

    this.galleryWrapperElement = document.querySelector(
      ".collections__gallery__wrapper"
    );

    this.collectionsElements = document.querySelectorAll(
      ".collections__article"
    );

    this.titlesElement = document.querySelector(".collections__titles");

    this.collectionsElementsActive = "collections__article--active";

    this.mediasElements = document.querySelectorAll(
      ".collections__gallery__media"
    );

    this.scroll = {
      current: 0,
      start: 0,
      target: 0,
      lerp: 0.1,
      velocity: 1,
    };

    this.createGeometry();
    this.createGallery();

    this.group.setParent(this.scene);
    this.show();
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
   * animate
   */

  show() {
    map(this.medias, (media) => media.show());
  }

  hide() {
    map(this.medias, (media) => media.hide());
  }

  /**
   * events
   */
  onResize(event) {
    this.sizes = event.sizes;

    this.bounds = this.galleryWrapperElement.getBoundingClientRect(); //recomended.Not call this in Upadte.because it impact to performance.

    this.scroll.last = this.scroll.target = 0;

    this.scroll.limit = this.bounds.width - this.medias[0].element.clientWidth;

    map(this.medias, (media) => {
      media.onResize(event, this.scroll);
    });
  }

  onTouchDown({ x, y }) {
    this.scroll.last = this.scroll.current;
  }

  onTouchMove({ x, y }) {
    let distance = x.start - x.end;

    this.scroll.target = this.scroll.last - distance;
  }

  onTouchUp({ x, y }) {}

  onWheel({ pixelX, pixelY }) {
    // this.scroll.target -= pixelX;
    this.scroll.target -= pixelY;
  }

  /**
   * change
   */
  onChange(index) {
    this.index = index;

    const selectedCollection = parseInt(
      this.mediasElements[this.index].getAttribute("data-index")
    );

    map(this.collectionsElements, (element, elementIndex) => {
      if (elementIndex === selectedCollection) {
        element.classList.add(this.collectionsElementsActive);
      } else {
        element.classList.remove(this.collectionsElementsActive);
      }
    });

    console.log(selectedCollection);

    this.titlesElement.style[this.prefixTransform] = `translateY(-${
      25 * selectedCollection
    }%) translate(-50%,-50%) rotate(-90deg)`;
  }

  /**
   * update
   */
  update() {
    if (!this.bounds) return;

    this.scroll.target = GSAP.utils.clamp(
      -this.scroll.limit,
      0,
      this.scroll.target
    );

    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      this.scroll.lerp
    );

    this.galleryElement.style[
      this.prefixTransform
    ] = `translateX(${this.scroll.current}px)`;

    if (this.scroll.last < this.scroll.current) {
      this.scroll.direction = "right";
    } else if (this.scroll.last > this.scroll.current) {
      this.scroll.direction = "left";
    }

    this.scroll.last = this.scroll.current;

    map(this.medias, (media, index) => {
      media.update(this.scroll.current);
    });

    const index = Math.floor(
      Math.abs(this.scroll.current / this.scroll.limit) * this.medias.length
    );

    if (this.index !== index) {
      this.onChange(index);
    }
  }

  /**
   * destroy
   */
  destroy() {
    this.scene.removeChild(this.group);
  }
}
