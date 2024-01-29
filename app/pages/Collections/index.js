import Page from "classes/Page";

export default class Collections extends Page {
  constructor() {
    super({
      id: "collections",
      // wrapper: ".collections__wrapper",
      element: ".collections",
    });
  }
}
