"use strict";
const webpack = require('webpack');
const path = require('path');

var APP_DIR = path.resolve(__dirname, 'public');


module.exports = {
    entry: {
        index_js: APP_DIR + "/index.js"
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
        path: path.resolve(__dirname, 'public/built'),
        filename: 'bundle.js',
        libraryTarget: "var",
        library: "pidgin"
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, 'public'),
                include: APP_DIR,
                loader: "babel-loader",
                query: {
                    presets: [
                        'es2015',
                        'react'
                    ]
                }
            }

        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            lodash: "lodash"
        })
    ],
    devtool: 'eval-source-map'
};