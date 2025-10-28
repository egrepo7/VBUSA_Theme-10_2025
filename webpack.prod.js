const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = merge(commonConfig, {
    devtool: 'source-map',
    mode: 'production',
    optimization: {
        noEmitOnErrors: true,
    },
});
