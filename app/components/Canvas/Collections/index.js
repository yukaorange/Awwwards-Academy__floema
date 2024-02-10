import { Plane, Transform } from "ogl";
import map from "lodash/map";
import GSAP from "gsap";
import Media from "./Media";
import prefix from "prefix";

export default class Collections {
  constructor({ gl, scene, sizes, transition }) {
    this.id = "collections";
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;
    this.transition = transition;
    this.media = null;

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

    this.onResize({
      sizes: this.sizes,
    });

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

  async show() {
    if (this.transition) {
      const { src } = this.transition.mesh.program.uniforms.tMap.value.image;

      const texture = window.TEXTURES[src];

      const media = this.medias.find((media) => {
        return media.texture === texture;
      });

      const scroll = -(
        media.bounds.left +
        media.bounds.width / 2 -
        window.innerWidth / 2
      );

      this.update(); //Actually , this is why gallery mesh rotation update.

      this.transition.animate(
        {
          rotation: media.mesh.rotation,
          position: {
            //when from detail to collections,mesh position.x will change in ...onComplete function(calculate scroll amount) => update.
            x: 0,
            y: media.mesh.position.y,
            z: 0,
          },
          scale: media.mesh.scale,
        },
        (_) => {
          map(this.medias, (item) => {
            if (media !== item) {
              item.show();
            }

            media.opacity.multiplier = 1;

            this.scroll.current =
              this.scroll.target =
              this.scroll.start =
              this.scroll.last =
                scroll;
          });
        }
      );
    } else {
      map(this.medias, (media) => media.show());
    }
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
    this.isDown = true;

    this.scroll.last = this.scroll.current;
  }

  onTouchMove({ x, y }) {
    let distance = x.start - x.end;

    if (this.isDown) {
      this.scroll.target = this.scroll.last - distance * 0.1;
    }
  }

  onTouchUp({ x, y }) {
    this.isDown = false;
  }

  onWheel({ pixelX, pixelY }) {
    // this.scroll.target -= pixelX;
    this.scroll.target -= pixelY;
  }

  /**
   * change
   */
  onChange(index) {
    this.index = index; //count up by scroll.0 => 1 => 2 => ...

    const selectedCollection = parseInt(
      this.mediasElements[this.index].getAttribute("data-index") //pickup the index from media's data-index.
    );

    map(this.collectionsElements, (element, elementIndex) => {
      if (elementIndex === selectedCollection) {
        element.classList.add(this.collectionsElementsActive);
      } else {
        element.classList.remove(this.collectionsElementsActive);
      }
    });

    this.titlesElement.style[this.prefixTransform] = `translateY(-${
      100 * selectedCollection
    }%) translate(-50%,-50%) rotate(-90deg)`;
  }

  /**
   * update
   */
  update() {
    // if (!this.bounds) return;

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

    let substract = this.medias[0].bounds.width / 2; //make the scroll.current to be next index when it's over the half of the media's width.

    const index = Math.floor(
      Math.abs((this.scroll.current - substract) / this.scroll.limit) *
        (this.medias.length - 1) //this.scroll.current / this.scroll.limit is 0-1. (ex: medias.length = 11, then index is 0-10)
    );

    if (this.index !== index) {
      this.onChange(index);
    }

    map(this.medias, (media) => {
      media.update(this.scroll.current, this.index);
    });
  }

  /**
   * destroy
   */
  destroy() {
    this.scene.removeChild(this.group);
  }
}
