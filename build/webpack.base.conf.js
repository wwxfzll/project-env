var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var pages = require('./pages')
var HappyPack = require('happypack')
var os = require('os')

var happyThreadPool = HappyPack.ThreadPool({
    size: os.cpus().length
})

const entrys = pages.entries.getJs()

Object.keys(entrys).forEach(function(name) {
    entrys[name] = [utils.resolve(`build/polyfills.js`)].concat(entrys[name])
})

module.exports = {
    entry: entrys,
    output: {
        path: config.build.assetsRoot,
        filename: '[name].js',
        publicPath: process.env.NODE_ENV === 'production'
            ? config.build.assetsPublicPath
            : config.dev.assetsPublicPath
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': utils.resolve('src'),
            '@assets': utils.resolve('src/assets'),
            '@components': utils.resolve('src/components'),
            '@plugins': utils.resolve('src/plugins'),
            '@pages': utils.resolve('src/pages'),
            '@common': utils.resolve('src/common'),
            '@lib': utils.resolve('src/lib'),
            '@business': utils.resolve('src/business')
        }
    },
    module: {
        rules: [
            // {
            //     test: /\.(js|vue)$/,
            //     loader: 'eslint-loader',
            //     enforce: 'pre',
            //     include: [resolve('src'), resolve('test')],
            //     options: {
            //         formatter: require('eslint-friendly-formatter')
            //     }
            // },
            {
                test: /\.vue$/,
                loader: 'happypack/loader?id=vue',
                include: [
                    utils.resolve('src'),
                    utils.resolve('node_modules/element-ui/src'),
                    utils.resolve('node_modules/element-ui/packages')
                ],
                // options: Object.assign({
                //     js: {
                //         test: /\.(js|jsx)$/,
                //         loader: 'babel-loader',
                //         include: [
                //             utils.resolve('src'),
                //             utils.resolve('node_modules/element-ui/src'),
                //             utils.resolve('node_modules/element-ui/packages')
                //         ],
                //         options: {
                //             cacheDirectory: process.env.NODE_ENV === 'production' ? false : true,
                //         },
                //     }
                // }, vueLoaderConfig)
            },
            {
                test: /\.js$/,
                loader: 'happypack/loader?id=js',
                include: [
                    utils.resolve('src'),
                    // utils.resolve('test'),
                    utils.resolve('node_modules/element-ui/src'),
                    utils.resolve('node_modules/element-ui/packages')
                ],
                // options: {
                //     cacheDirectory: process.env.NODE_ENV === 'production' ? false : true,
                // },
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    },
    plugins: [
        new HappyPack({
            id: 'vue',
            threadPool: happyThreadPool,
            verbose: process.env.HAPPY_VERBOSE === '1',
            loaders: [{
                path: 'vue-loader',
                // include: [
                //     utils.resolve('src'),
                //     utils.resolve('node_modules/element-ui/src'),
                //     utils.resolve('node_modules/element-ui/packages')
                // ],
                query: Object.assign({
                    js: {
                        test: /\.(js|jsx)$/,
                        loader: 'babel-loader',
                        include: [
                            utils.resolve('src'),
                            utils.resolve('node_modules/element-ui/src'),
                            utils.resolve('node_modules/element-ui/packages')
                        ],
                        options: {
                            cacheDirectory: process.env.NODE_ENV === 'production' ? false : true,
                        },
                    }
                }, vueLoaderConfig)
            }]
        }),
        new HappyPack({
            id: 'js',
            threadPool: happyThreadPool,
            verbose: process.env.HAPPY_VERBOSE === '1',
            loaders: [{
                path: 'babel-loader',
                // include: [
                //     utils.resolve('src'),
                //     // utils.resolve('test'),
                //     utils.resolve('node_modules/element-ui/src'),
                //     utils.resolve('node_modules/element-ui/packages')
                // ],
                query: {
                    cacheDirectory: process.env.NODE_ENV === 'production' ? false : true,
                },
            }]
        }),
    ]
}
