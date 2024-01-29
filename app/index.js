import each from "lodash/each";
import normalizeWheel from "normalize-wheel";

import Canvas from "components/Canvas";

import Navigation from "components/Navigation";
import Preloader from "components/Preloader";

import Home from "pages/Home";
import About from "pages/About";
import Detail from "pages/Detail";
import Collections from "pages/Collections";

class App {
  constructor() {
    this.createContent();

    this.createPreloader();

    this.createNavigation();

    this.createCanvas();

    this.createPages();

    this.addEventListeners();

    this.addLinkListeners();

    this.update();
  }

  createNavigation() {
    this.navigation = new Navigation({
      template: this.template,
    });
  }

  createPreloader() {
    this.preloader = new Preloader();

    this.preloader.once("completed", () => {
      this.onPreloaded();
    });
  }

  createContent() {
    this.content = document.querySelector(".content");

    this.template = this.content.getAttribute("data-template");
  }

  createCanvas() {
    this.canvas = new Canvas();
  }

  createPages() {
    this.pages = {
      home: new Home(),
      about: new About(),
      detail: new Detail(),
      collections: new Collections(),
    };

    this.page = this.pages[this.template];

    this.page.create();
  }

  onPreloaded() {
    this.preloader.destroy();

    this.onResize();

    this.page.show();
  }

  async onChange(url) {
    await this.page.hide();

    const request = await window.fetch(url);

    if (request.status === 200) {
      const html = await request.text();

      const div = document.createElement("div");
      div.innerHTML = html;
      const divContent = div.querySelector(".content");

      this.template = divContent.getAttribute("data-template");

      this.content.setAttribute("data-template", this.template);

      this.navigation.onChange(this.template);

      this.content.innerHTML = divContent.innerHTML;

      this.page = this.pages[this.template];

      this.page.create();

      this.onResize();

      this.page.show();

      this.addLinkListeners(); //q I'm worrying that this method is called multiplex times and it's not necessary to call it again and again.Just it's gonna make trouble for the browser.
    } else {
      console.log("error");
    }
  }

  /**
   * events
   */

  onResize() {
    // this method is called both in the time of constructing and window resize.
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }
    
    window.requestAnimationFrame((_) => {
      if (this.canvas && this.canvas.onResize) {
        this.canvas.onResize();
      }
    });
  }

  onTouchDown(event) {
    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    if (this.page && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(event);
    }
  }

  onWheel(event) {
    const normalizedWheel = normalizeWheel(event);

    if (this.canvas && this.canvas.update) {
      this.canvas.onWheel(normalizedWheel);
    }

    if (this.page && this.page.update) {
      this.page.onWheel(normalizedWheel);
    }
  }

  addLinkListeners() {
    const links = document.querySelectorAll("a");

    each(links, (link) => {
      link.onclick = (event) => {
        const { href } = link;

        event.preventDefault();
        this.onChange(href);
      };
    });
  }

  // Listeners
  addEventListeners() {
    window.addEventListener("mousedown", (event) => {
      this.onTouchDown(event);
    });

    window.addEventListener("mousemove", (event) => {
      this.onTouchMove(event);
    });

    window.addEventListener("mouseup", (event) => {
      this.onTouchUp(event);
    });

    window.addEventListener("touchstart", (event) => {
      this.onTouchDown(event);
    });

    window.addEventListener("touchmove", (event) => {
      this.onTouchMove(event);
    });

    window.addEventListener("touchend", (event) => {
      this.onTouchUp(event);
    });

    window.addEventListener("wheel", (event) => {
      this.onWheel(event);
    });

    window.addEventListener("resize", (event) => {
      this.onResize(event);
    });
  }

  // Loop
  update() {
    if (this.canvas && this.canvas.update) {
      this.canvas.update();
    }

    if (this.page && this.page.update) {
      this.page.update();
    }

    this.frame = window.requestAnimationFrame(this.update.bind(this));
  }
}

new App();
