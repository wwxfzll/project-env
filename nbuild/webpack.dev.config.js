var webpack = require('webpack')
var path = require('path')
var pages = require('../build/pages')
var utils = require('../build/utils')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var ServerPath = require('./serverPath')
var CopyWebpackPlugin = require('copy-webpack-plugin')

const entrys = pages.entries.getJs()
Object.keys(entrys).forEach(function(name) {
    entrys[name] = [utils.resolve(`build/polyfills.js`)].concat(entrys[name])
})

module.exports = {
    entry: entrys,
    output: {
        path: path.resolve(__dirname, ServerPath.path),
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: utils.assetsPath('js/[name].[chunkhash].js'),
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': utils.resolve('src'),
            '@assets': utils.resolve('src/assets'),
            '@components': utils.resolve('src/components'),
            '@plugins': utils.resolve('src/plugins'),
            '@views': utils.resolve('src/views'),
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
            //     include: [utils.resolve('src')],
            //     options: {
            //         formatter: require('eslint-friendly-formatter')
            //     }
            // },
            {
                test: /\.js$/,
                include: [
                    utils.resolve('src'),
                    utils.resolve('node_modules/element-ui/src'),
                    utils.resolve('node_modules/element-ui/packages')
                ],
                use: ['babel-loader']
            },
            {
                 test: /\.vue$/,
                 include: [
                     utils.resolve('src'),
                     utils.resolve('node_modules/element-ui/src'),
                     utils.resolve('node_modules/element-ui/packages'),
                     utils.resolve('node_modules/element-ui/lib')
                     //utils.resolve('node_modules/element-ui/packages/date-picker/src/basic')
                 ],
                 use: ['vue-loader']
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
        ].concat(utils.styleLoaders({
            sourceMap: true,
            extract: true
        }))
    },
    watch: true,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            },
            '__clientMock__': false,
            '__category__': JSON.stringify(process.env.npm_config_category)
        }),
        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].[contenthash].css')
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: path.resolve(__dirname, ServerPath.path + '/static'),
                ignore: ['.*']
            }
        ])
    ]
}


pages.entries.getHtml().forEach((obj)=>{
    module.exports.plugins.push(new HtmlWebpackPlugin({
        filename: obj.filename,
        template: obj.template, //模板路径
        inject: true,
        excludeChunks: obj.excludeChunks
    }))
})
