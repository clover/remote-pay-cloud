const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        "clover": "./index.js",
        "clover.min": "./index.js"
    },
    output: {
        path: path.join(__dirname, 'bundle'),
        filename: '[name].js',
        libraryTarget: 'var',
        library: 'clover'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ]
};