var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'
var path = require('path')

module.exports = {
    loaders: Object.assign({
        js: {
            test: /\.(js|jsx)$/,
            loader: 'babel-loader',
            include: [utils.resolve('src')],
            options: {
                cacheDirectory: isProduction ? false : true,
            },
        }
    }, utils.cssLoaders({
        sourceMap: isProduction
            ? config.build.productionSourceMap
            : config.dev.cssSourceMap,
        extract: isProduction
    }))
}
