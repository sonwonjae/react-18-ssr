const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const LoadablePlugin = require("@loadable/webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const DIST_PATH = path.resolve(__dirname, "dist");
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const mode = isDev ? "development" : "production";

/**
 * @param {'web' | 'node'} target
 */
const generateConfig = (target) => {
  return {
    name: target,
    target,
    mode,
    entry: {
      home: [
        target === "web" && ["webpack-hot-middleware/client"],
        `./src/pages/home/${target}.jsx`,
      ].filter(Boolean),
      second: [
        target === "web" && ["webpack-hot-middleware/client"],
        `./src/pages/second/${target}.jsx`,
      ].filter(Boolean),
    },
    devtool: "inline-source-map",
    resolve: {
      extensions: [".js", ".jsx", ".json", ".css"],
    },
    module: {
      rules: [
        {
          test: /\.(?:js|jsx|mjs|cjs)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            "css-loader",
          ],
        },
      ],
    },
    plugins: [
      new ReactRefreshWebpackPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new LoadablePlugin({ writeToDisk: true }),
      new MiniCssExtractPlugin(),
    ],
    output: {
      filename: "[name].js",
      path: path.join(DIST_PATH, target),
      publicPath: `/dist/${target}/`,
      ...(target === "node" && {
        libraryTarget: "commonjs2",
      }),
    },
    ...(target === "node" && {
      externals: ["@loadable/component", nodeExternals()],
    }),
  };
};

module.exports = [generateConfig("web"), generateConfig("node")];
