var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './src/ts/calendar.ts',
    output: {
        path: path.join(__dirname, '/src/js/'),
        filename: 'calendar.min.js'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.d.ts', '.js'],
        modulesDirectories: ['node_modules', 'bower_components']
    },
    module: {
        loaders: [{
            test: /\.ts$/,
            loader: 'ts-loader'
        }]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                unused: false,
                warnings: false
            }
        })
    ]
};