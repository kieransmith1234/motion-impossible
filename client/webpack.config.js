// Webpack config
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const API_URL = isProduction ? 'http://77.68.114.237:5000' : 'http://localhost:5000';

const config = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      'process.env.API_URL': JSON.stringify(API_URL),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
      chunksSortMode: 'auto',
      publicPath: '/',
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  mode: process.env.NODE_ENV || 'development',
};

if (!isProduction) {
  config.devtool = 'inline-source-map';
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.devServer = {
    allowedHosts: ['localhost:3000'],
    client: {
      progress: true,
    },
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/',
    },
    compress: true,
    hot: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
  };
} else {
  config.output.filename = '[name].production.bundle.js';
}

module.exports = config;