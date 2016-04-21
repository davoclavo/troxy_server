// module.exports = {
//     context: __dirname,

//     entry: {
//         app: "./web/static/js/app.js"
//     },
//     output: {
//         path: "./priv/static/js",
//         filename: "app.js"
//     },
//     module: {
//         loaders: [{
//             test: /\.jsx?$/,
//             exclude: /node_modules/,
//             loaders: [ 'babel' ]
//         },
//         {
//             test: /\.scss$/,
//             loaders: [ 'style', 'css', 'autoprefixer', 'sass' ]
//         }]
//     },
//     resolve: {
//         modulesDirectories: [
//             'web/static',
//             'deps/phoenix/web/static/js/',
//             'node_modules'
//         ],
//         extensions: [ '', '.js', '.json', '.jsx', '.scss' ]
//     }
// };



var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: {
    "app": ["./web/static/css/app.scss", "./web/static/js/app.js"],
  },

  output: {
    path: "./priv/static",
    filename: "js/app.js"
  },

  resolve: {
    modulesDirectories: [ "node_modules", __dirname + "/web/static/js" ],
    extensions: [ "", ".js", ".json", ".jsx" ]
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel",
        query: {
          presets: ["es2015"]
        }
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style", "css")
      }, {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          "style",
          "css!sass?includePaths[]=" + __dirname +  "/node_modules"
        )
      },
      {
        test: /\.(ttf|eot|svg|woff2?)$/,
        loader : "file-loader?name=fonts/[name].[ext]"
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin("css/app.css"),
  ]
}
