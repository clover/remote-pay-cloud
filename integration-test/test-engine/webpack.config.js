"use strict";
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        index_js: "./index.js"
    },
    resolve: {
        extensions: [".js"],
        alias: {
            'remotepay': path.resolve(path.join(__dirname, 'node_modules', 'remote-pay-cloud-api')),
            'remote-pay-cloud-api': path.resolve(path.join(__dirname, 'node_modules', 'remote-pay-cloud-api')),
            'sdk': path.resolve(path.join(__dirname, 'node_modules', 'remote-pay-cloud-api')),
            'clover': path.resolve(path.join(__dirname, 'node_modules', 'remote-pay-cloud-api'))
        }
    },
    output: {
        path: path.resolve(__dirname, 'built'),
        filename: 'bundle.js',
        libraryTarget: "var",
        library: "pidgin"
    },
    module: {
        loaders: [
            {
                loader: "babel-loader",
                query: {
                    presets: [
                        'env'
                    ]
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            lodash: "lodash"
        }),
    ]
};