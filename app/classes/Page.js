import each from "lodash/each";
import map from "lodash/map";
import GSAP from "gsap";
import Prefix from "prefix";
import Title from "animations/Title";
import Paragraph from "animations/Paragraph";
import Label from "animations/Label";
import Highlight from "animations/Highlight";
import AsyncLoad from "./Asyncload";
import { ColorsManager } from "./Colors";

export default class Page {
  constructor({ element, elements, id }) {
    this.id = id;

    this.selector = element;

    this.selectorChildren = {
      ...elements,
      animationsTitles: '[data-animation="title"]',
      animationsLabels: '[data-animation="label"]',
      animationsParagraphs: '[data-animation="paragraph"]',
      animationsHighlights: '[data-animation="highlight"]',

      preloaders: "[data-src]",
    };

    this.transformPrefix = Prefix("transform");

  }

  create() {
    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      limit: 1000, //this amount is gonnabe the height of the page
    };

    this.element = document.querySelector(this.selector);

    this.elements = {};

    each(this.selectorChildren, (entry, key) => {
      if (
        entry instanceof window.HTMLElement ||
        entry instanceof window.NodeList
      ) {
        this.elements[key] = entry;
      } else {
        this.elements[key] = this.element.querySelectorAll(entry);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = this.element.querySelector(entry);
        }
      }
    });

    this.createAnimations();

    this.createPreloaders();
  }

  createAnimations() {
    this.animations = [];

    //titles.
    this.animationsTitles = map(this.elements.animationsTitles, (element) => {
      return new Title({
        element,
      });
    });
    this.animations.push(...this.animationsTitles);

    //paragraphs.
    this.animationsParagraphs = map(
      this.elements.animationsParagraphs,
      (element) => {
        return new Paragraph({
          element,
        });
      }
    );
    this.animations.push(...this.animationsParagraphs);

    //labels.
    this.animationsLabels = map(this.elements.animationsLabels, (element) => {
      return new Label({
        element,
      });
    });
    this.animations.push(...this.animationsLabels);

    //highlights.
    this.animationsHighlights = map(
      this.elements.animationsHighlights,
      (element) => {
        return new Highlight({
          element,
        });
      }
    );
    this.animations.push(...this.animationsHighlights);
  }

  createPreloaders() {
    this.preloaders = map(this.elements.preloaders, (element) => {
      return new AsyncLoad({
        element,
      });
    });
  }

  /**
   * animations
   */
  show() {
    return new Promise((resolve) => {
      ColorsManager.change({
        backgroundColor: this.element.getAttribute("data-background"),
        color: this.element.getAttribute("data-color"),
      });

      this.animationIn = GSAP.timeline();

      this.animationIn.fromTo(
        this.element,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          onComplete: resolve,
        }
      );

      this.animationIn.call((_) => {
        this.addEventListeners();
        resolve(); //I think this line is not necessary.
      });
    });
  }

  hide() {
    return new Promise((resolve) => {
      this.destroy();

      this.animationOut = GSAP.timeline();

      this.animationOut.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve,
      });
    });
  }

  /**
   * destroy
   */
  destroy() {
    this.removeEventListeners();
  }

  /**
   * events
   */
  onWheel({ pixelY }) {
    this.scroll.target += pixelY;
  }

  onResize() {
    if (this.elements.wrapper) {
      this.scroll.limit =
        this.elements.wrapper.clientHeight - window.innerHeight;
    }

    each(this.animations, (animation) => {
      animation.onResize();
    });
  }

  /**
   * loop
   */
  update() {
    this.scroll.target = GSAP.utils.clamp(
      0,
      this.scroll.limit,
      this.scroll.target
    );

    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      0.1
    );

    if (this.scroll.current < 0.01) {
      this.scroll.current = 0;
    }

    if (this.elements.wrapper) {
      this.elements.wrapper.style[
        this.transformPrefix
      ] = `translateY(-${this.scroll.current}px)`;
    }
  }

  /**
   * listeners
   */
  addEventListeners() {
  }

  removeEventListeners() {
  }
}
