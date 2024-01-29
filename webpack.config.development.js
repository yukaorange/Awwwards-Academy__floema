const { merge } = require("webpack-merge");
const path = require("path");

// const webpack = require("webpack");

const config = require("./webpack.config");

module.exports = merge(config, {
  mode: "development",

  devtool: "inline-source-map",

  devServer: {
    writeToDisk: true,
    // inline: true,
    // hot: true,
    // contentBase: path.resolve(__dirname, "public"),
    // watchContentBase: true,
    // proxy: {
    //   '/': 'http://localhost:3000'
    // },
  },

  // plugins: [new webpack.HotModuleReplacementPlugin()],

  optimization: {
    minimize: false,
  },

  output: {
    path: path.resolve(__dirname, "public"),
  },
});
