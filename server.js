const path = require("path");

const webpack = require("webpack");
const webpackHotMiddleware = require("webpack-hot-middleware");

const { renderToString } = require("react-dom/server");
const { ChunkExtractor } = require("@loadable/server");
const React = require("react");

const express = require("express");
const app = express();

app.use("/dist", express.static(path.join(__dirname, "dist")));

if (process.env.NODE_ENV !== "production") {
  const webpack = require("webpack");
  const webpackDevMiddleware = require("webpack-dev-middleware");

  const configs = require("./webpack.config.js");

  configs.forEach((config) => {
    const compiler = webpack(config);

    app.use(
      webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        writeToDisk: true,
      })
    );
    app.use(webpackHotMiddleware(compiler));
  });
}

app.get(["/", "/second"], (req, res) => {
  const url = req.originalUrl;
  const page = (url === "/" ? "/home" : url).replace(/^\//, "");

  // ✅ 캐시 무효화
  Object.keys(require.cache).forEach((id) => {
    if (id.includes("/dist/node/") && !id.includes("node_modules")) {
      delete require.cache[id];
    }
  });

  const nodeStats = path.resolve(__dirname, "./dist/node/loadable-stats.json");
  const webStats = path.resolve(__dirname, "./dist/web/loadable-stats.json");

  const nodeExtractor = new ChunkExtractor({
    entrypoints: page,
    statsFile: nodeStats,
  });
  const { default: App } = nodeExtractor.requireEntrypoint();

  const webExtractor = new ChunkExtractor({
    entrypoints: page,
    statsFile: webStats,
  });
  const jsx = webExtractor.collectChunks(React.createElement(App));
  const html = renderToString(jsx);

  res.set("content-type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          ${webExtractor.getLinkTags()}
          ${webExtractor.getStyleTags()}
      </head>
      <body>
        <div id="root">${html}</div>
        ${webExtractor.getScriptTags()}
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log("run app");
});
