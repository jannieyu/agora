const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  entry: {
    app: [path.resolve(__dirname, "../../src/index.tsx")],
  },
  module: {
    rules: [
      {
        test: /.jsx|.tsx?$/,
        loader: "babel-loader",
        options: { presets: ["@babel/env", "@babel/preset-react"] },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "../../src")],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      react: path.resolve(__dirname, "../../node_modules", "react"),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].bundle.css",
    }),
  ],
  devServer: {
    contentBase: "../../public/",
  },
  output: {
    path: path.resolve(__dirname, "../../public/bundles"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].js",
    publicPath: "/bundles/",
  },
  mode: "development",
}
