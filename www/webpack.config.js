const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "index.html" },
      ]
    })
  ],
  // 支持 WebAssembly 打包
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
  },
};
