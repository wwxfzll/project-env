var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var ChunkIDsByFilePath = require('../webpackPlugins/chunkIDsByFilePath')
var ModuleIDbyFilePath = require('../webpackPlugins/moduleIDbyFilePath')
var AddCommonScript = require('../webpackPlugins/addCommonScript')
var pages = require('./pages')
var os = require('os')
// var UglifyJsParallelPlugin = require('webpack-uglify-parallel')

var env = config.build.env

function checkPath(module, list = ['../node_modules']) {
    const resource = module.resource
    if(resource && (/\.js$/.test(resource))) {
        for(let i = 0, len = list.length; i < len; i++) {
            if(resource.includes(path.join(__dirname, list[i]))) {
                // console.log(resource)
                return true
            }
        }
        return false
    }
}

var webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true
        })
    },
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: utils.assetsPath('js/[name].[chunkhash].js')
    },
    plugins: [
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new webpack.DefinePlugin({
            'process.env': env,
            '__clientMock__': config.clientMock,
            '__category__': JSON.stringify(config.category)
        }),
        new webpack.HashedModuleIdsPlugin(),
        new ChunkIDsByFilePath(),
        new ModuleIDbyFilePath(),
        new webpack.optimize.UglifyJsPlugin({
            // 最紧凑的输出
            beautify: false,
            // 删除所有的注释
            comments: false,
            compress: {
                // 在UglifyJs删除没有用到的代码时不输出警告
                warnings: false,
                // 删除所有的 `console` 语句
                // 还可以兼容ie浏览器
                drop_console: true,
                // 内嵌定义了但是只用到一次的变量
                collapse_vars: true,
                // 提取出出现多次但是没有定义成变量去引用的静态值
                reduce_vars: true,
            },
            sourceMap: true
        }),
        // new UglifyJsParallelPlugin({
        //     workers: os.cpus().length - 1,
        //     // output: {
        //     //     ascii_only: true,
        //     // },
        //     // 最紧凑的输出
        //     beautify: false,
        //     // 删除所有的注释
        //     comments: false,
        //     compress: {
        //         // 在UglifyJs删除没有用到的代码时不输出警告
        //         warnings: false,
        //         // 删除所有的 `console` 语句
        //         // 还可以兼容ie浏览器
        //         drop_console: true,
        //         // 内嵌定义了但是只用到一次的变量
        //         collapse_vars: true,
        //         // 提取出出现多次但是没有定义成变量去引用的静态值
        //         reduce_vars: true,
        //     },
        //     sourceMap: false
        // }),
        // extract css into its own file
        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].[contenthash].css'),
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),
        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        // new HtmlWebpackPlugin({
        //     filename: config.build.index,
        //     template: 'index.html',
        //     inject: true,
        //     minify: {
        //         removeComments: true,
        //         collapseWhitespace: true,
        //         removeAttributeQuotes: true
        //         // more options:
        //         // https://github.com/kangax/html-minifier#options-quick-reference
        //     },
        //     // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        //     chunksSortMode: 'dependency'
        // }),
        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function(module, count) {
                if(checkPath(module)) {
                    return true
                }
                return false
            }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vendor']
        }),
        new webpack.optimize.CommonsChunkPlugin({
            async: 'vendor-lazy',
            children: true,
            minChunks: function(module, count) {
                if(checkPath(module)) {
                    return true
                }
                return false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            async: 'used-twice',
            children: true,
            minChunks(module, count) {
                if(count > 1) {
                    return true
                }
                // if(checkPath(option.root, module)){
                //     return true
                // }
                return false
            }
        }),
        new AddCommonScript({
            paths:['/static/common/js/browerVersion.js']
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.build.assetsSubDirectory,
                ignore: ['.*']
            }
        ])
    ]
})

pages.entries.getHtml().forEach((obj)=>{
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: obj.filename,
        template: obj.template, //模板路径
        // favicon: obj.favicon,
        // favicon: '',
        inject: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
            // more options:
            // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // inlineSource: 'manifest.*.js$',
        chunksSortMode: 'dependency',
        excludeChunks: obj.excludeChunks
    }))
})

if(config.build.productionGzip) {
    var CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if(config.build.bundleAnalyzerReport) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
