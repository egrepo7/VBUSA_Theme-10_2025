const webpack = require('webpack'),
      merge = require('webpack-merge'),
      commonConfig = require('./webpack.common.js');

module.exports = merge(commonConfig, {
    devtool: 'eval-cheap-module-source-map', // Faster than inline-source-map
    mode: 'development',
    performance: {
        hints: false,
    },
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    },
    cache: {
        type: 'memory',
    },
});
