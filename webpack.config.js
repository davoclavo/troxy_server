module.exports = {
    context: __dirname,

    entry: "./web/static/js/app.js",
    output: {
        path: "./priv/static/js",
        filename: "app.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: [ 'babel' ]
        },
        {
            test: /\.jsx$/,
            loaders: [ 'babel' ],
            exclude: /node_modules/
        },
        {
            test: /\.scss$/,
            loaders: [ 'style', 'css', 'autoprefixer', 'sass' ]
        }]
    },
    resolve: {
        modulesDirectories: [
            'web/static',
            'deps/phoenix/web/static/js/',
            'node_modules'
        ],
        extensions: [ '', '.js', '.json', '.jsx', '.scss' ]
    }
};
