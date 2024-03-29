import Component from "classes/Component";

export default class Animation extends Component {
  constructor({ element,elements }) {
    super({
      element,
      elements
    });

    this.element = element;

    this.createObserver();

    this.animateOut()//in advance hidden Animation elements.(Call GSAP.set in Super class)
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateIn();
        } else {
          this.animateOut();
        }
      });
    });

    this.observer.observe(this.element);
  }

  animateIn() {}

  animateOut() {}
}
