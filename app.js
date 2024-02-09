require("dotenv").config();

const express = require("express");
const errorHandler = require("errorhandler");
const path = require("path");
const logger = require("morgan");
const methodOverride = require("method-override");

const app = express();
const port = 3000;

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(errorHandler());
app.use(methodOverride());

app.use(express.static(path.join(__dirname, "public")));

const Prismic = require("@prismicio/client");
const PrismicDOM = require("prismic-dom");
const uaPerser = require("ua-parser-js");

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req: req,
  });
};

const handleLinkResolver = (doc) => {
  if (doc.type === "product") {
    return `/detail/${doc.uid}`;
  }

  if (doc.type === "collections") {
    return `/collections`;
  }

  if (doc.type === "about") {
    return "/about";
  }

  return "/";
};

app.use((req, res, next) => {
  // res.locals.ctx = {
  //   endpoint: process.env.PRISMIC_ENDPOINT,
  //   linkResolver: handleLinkResolver,
  // };
  const ua = uaPerser(req.headers["user-agent"]);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isPhone = ua.device.type === "mobile";
  res.locals.isTablet = ua.device.type === "tablet";

  console.log(
    ua.device.type,
    res.locals.isDesktop,
    res.locals.isPhone,
    res.locals.isTablet
  );

  res.locals.Link = handleLinkResolver;

  res.locals.Numbers = (index) => {
    return index == 0
      ? "One"
      : index == 1
      ? "Two"
      : index == 2
      ? "Three"
      : index == 3
      ? "Four"
      : "";
  };

  res.locals.PrismicDOM = PrismicDOM;

  next();
});

app.set("views", path.join(__dirname, "views")); //(1)set the views directory
app.set("view engine", "pug");

const handleRequest = async (api) => {
  const meta = await api.getSingle("meta");
  const home = await api.getSingle("home");
  const about = await api.getSingle("about");
  const navigation = await api.getSingle("navigation");
  const preloader = await api.getSingle("preloader");

  const { results: collections } = await api.query(
    Prismic.Predicates.at("document.type", "collection"),
    {
      fetchLinks: "product.image",
    }
  );

  let assets = [];

  home.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  about.data.gallery.forEach((item) => {
    assets.push(item.image.url);
  });

  about.data.body.forEach((section) => {
    if (section.slice_type === "gallery") {
      section.items.forEach((item) => {
        assets.push(item.image.url);
      });
    }
  });

  collections.forEach((collection) => {
    collection.data.products.forEach((item) => {
      assets.push(item.products_product.data.image.url);
    });
  });

  return {
    assets,
    collections,
    home,
    about,
    meta,
    navigation,
    preloader,
  };
};

app.get("/", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render("pages/home", {
    //this method will look for a file called "string.xxx" inside the views directory.
    ...defaults,
  });
});

app.get("/about", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render("pages/about", {
    ...defaults,
  });
});

app.get("/collections", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render("pages/collections", {
    ...defaults,
  });
});

app.get("/detail/:uid", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  const product = await api.getByUID("product", req.params.uid, {
    fetchLinks: "collection.title",
  });

  res.render("pages/detail", {
    ...defaults,
    product,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
