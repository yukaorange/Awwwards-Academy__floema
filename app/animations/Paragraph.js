import Animation from "../classes/Animation";
import GSAP from "gsap";
import { calculate, split } from "../utils/text";
import each from "lodash/each";

export default class Paragraph extends Animation {
  constructor({ element, elements }) {
    super({ element, elements });

    this.elementLinesSpans = split({
      append: true,
      element: this.element,
    });

  }

  animateIn() {
    this.timelineIn = GSAP.timeline({
      delay: 0.5,
    });

    this.timelineIn.set(this.element, {
      autoAlpha: 1,
    });

    each(this.elementLines, (line, index) => {
      this.timelineIn.fromTo(
        line,
        {
          autoAlpha: 0,
          y: "100%",
        },
        {
          autoAlpha: 1,
          delay: 0.5 + index * 0.2,
          duration: 1.5,
          y: "0%",
          ease: "expo.out",
        },
        "0"
      );
    });
  }

  animateOut() {
    GSAP.set(this.element, {
      autoAlpha: 0,
    });
  }

  onResize() {
    this.elementLines = calculate(this.elementLinesSpans);
  }
}
