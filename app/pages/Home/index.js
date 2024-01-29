import Page from "classes/Page";
import Button from "classes/Button";

export default class Home extends Page {
  constructor() {
    super({
      id: "home",
      element: ".home",
      // wrapper: ".home__wrapper",
      elements: {
        navigation: document.querySelector(".navigation"),
        link: ".home__link",
      },
    });
  }

  create() {
    super.create();

    this.link = new Button({
      element: this.elements.link,
    });


    this.elements.link.addEventListener("click", (_) => {
      console.log("oh click me");
    });
  }

  destroy() {
    super.destroy();
    this.link.removeEventListeners();
  }
}
