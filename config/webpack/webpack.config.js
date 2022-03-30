const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = {
  entry: {
    app: [path.resolve(__dirname, "../../src/js/base/index.tsx")],
  },
  module: {
    rules: [
      {
        test: /.jsx|.tsx?$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
          // Helps with browser compatability
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          },
        ],
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
    static: {
      directory: "../../static/",
    },
    proxy: {
      context: ["/api"],
      target: "http://127.0.0.1:8000",
    },
    historyApiFallback: true,
  },
  output: {
    path: path.resolve(__dirname, "../../static/bundles"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].js",
    publicPath: "/bundles/",
  },
  mode: "development",
}
