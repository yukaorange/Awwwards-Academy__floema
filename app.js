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

  if(doc.type === "collections") {
    return `/collections`;
  }

  if (doc.type === "about") {
    return "/about";
  }

  console.log(doc);
  return "/";
};

app.use((req, res, next) => {
  // res.locals.ctx = {
  //   endpoint: process.env.PRISMIC_ENDPOINT,
  //   linkResolver: handleLinkResolver,
  // };

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
  const navigation = await api.getSingle("navigation");
  const preloader = await api.getSingle("preloader");

  return {
    meta,
    navigation,
    preloader,
  };
};

app.get("/", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  const home = await api.getSingle("home");

  console.log(home.data)


  const { results: collections } = await api.query(
    Prismic.Predicates.at("document.type", "collection"),
    {
      fetchLinks: "product.image",
    }
  );

  res.render("pages/home", {
    //this method will look for a file called "string.xxx" inside the views directory.
    ...defaults,
    home,
    collections,
  });
});

app.get("/about", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  const about = await api.getSingle("about");

  // console.log(about.data)

  res.render("pages/about", {
    ...defaults,
    about,
  });
});

app.get("/collections", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  const home = await api.getSingle("home");

  const { results: collections } = await api.query(
    Prismic.Predicates.at("document.type", "collection"),
    {
      fetchLinks: "product.image",
    }
  );

  res.render("pages/collections", {
    ...defaults,
    collections,
    home,
  });
});

app.get("/detail/:uid", async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  const product = await api.getByUID("product", req.params.
  uid, {
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
