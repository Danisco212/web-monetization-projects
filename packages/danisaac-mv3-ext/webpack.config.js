const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    'content-script': './static/content-script.js',
    injection: './static/injection/injection.js',
    background: './static/background-script.js'
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: 'babel-loader'
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    // new HtmlWebpackPlugin(),
    // new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: path.resolve(__dirname, 'dist') },
        {
          from: './res/icon16.png',
          to: path.resolve(__dirname, 'dist/images'),
          noErrorOnMissing: true
        },
        {
          from: './res/icon19.png',
          to: path.resolve(__dirname, 'dist/images')
        },
        {
          from: './res/icon38.png',
          to: path.resolve(__dirname, 'dist/images')
        },
        {
          from: './res/icon48.png',
          to: path.resolve(__dirname, 'dist/images')
        },
        {
          from: './res/icon128.png',
          to: path.resolve(__dirname, 'dist/images')
        }
      ]
    })
  ],
  mode: 'production'
}
