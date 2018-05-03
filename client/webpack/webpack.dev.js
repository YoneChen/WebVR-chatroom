const path = require('path');
// webpack plugins
const webpackConfig = require('./webpack.config');
const webpackMerge = require('webpack-merge');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');

module.exports = webpackMerge(webpackConfig,{


  output: {

    path: path.resolve(__dirname, '../../static/'),

    filename: '[name].js',

    sourceMapFilename: '[name].map',

    chunkFilename: '[id]-chunk.js',

    publicPath: '/'

  },
  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: "'development'"
      }
    })
  ],
  devtool: 'inline-source-map',

  devServer: {
    https: true,
    host: 'localhost',
    port: 9001,
    open: true,
    openPage: '',
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }

});
