var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var pages = require('./pages')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function(name) {
    baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({sourceMap: config.dev.cssSourceMap})
    },
    // cheap-module-eval-source-map is faster for development
    devtool: '#cheap-module-eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': config.dev.env,
            '__clientMock__': config.clientMock,
            '__category__': JSON.stringify(config.category)
        }),
        new webpack.NamedModulesPlugin (),
        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        // new HtmlWebpackPlugin({
        //     filename: 'index.html',
        //     template: 'index.html',
        //     inject: true
        // }),
        new FriendlyErrorsPlugin()
    ]
})

pages.entries.getHtml().forEach((obj)=>{
    module.exports.plugins.push(new HtmlWebpackPlugin({
        filename: obj.filename,
        template: obj.template, //模板路径
        inject: true,
        excludeChunks: obj.excludeChunks
        // inlineSource: 'manifest.*.js$',
    }))
})
