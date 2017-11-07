"use strict";
const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        index_js: "./pidgin/public/index.js"
    },
    resolve: {
        extensions: [".js"]
    },
    output: {
        path: path.resolve(__dirname, "./public/built"),
        filename: "[name]-bundle.js",
        libraryTarget: "var",
        library: "pidgin"
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            lodash: "lodash"
        })
    ]
};
