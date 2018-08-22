var webpack = require('webpack')
var path = require('path')
var pages = require('../build/pages')
var utils = require('../build/utils')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var AddCommonScript = require('../webpackPlugins/addCommonScript')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var vueLoaderConfig = require('../build/vue-loader.conf')
var ServerPath = require('./serverPath')

const entrys = pages.entries.getJs()
Object.keys(entrys).forEach(function(name) {
    entrys[name] = [utils.resolve(`build/polyfills.js`)].concat(entrys[name])
})


var serverDebug = process.env.npm_config_server ? true : false

var rules = [
    {
        test: /\.js$/,
        include: [
            utils.resolve('src'),
            utils.resolve('node_modules/element-ui/src'),
            utils.resolve('node_modules/element-ui/packages')
        ],
        use: ['babel-loader'],
    },
    {
        test: /\.vue$/,
        include: [
            utils.resolve('src'),
            utils.resolve('node_modules/element-ui/src'),
            utils.resolve('node_modules/element-ui/packages')
            //utils.resolve('node_modules/element-ui/packages/date-picker/src/basic')
        ],
        loader: 'vue-loader',
        options: vueLoaderConfig
    },
    {
        test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
        loader: 'url-loader',
        options: {
            limit: 10000,
            name: serverDebug ? utils.assetsPath('img/[name].[ext]') : utils.assetsPath('img/[name].[hash:7].[ext]')
        }
    },
    {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
            limit: 10000,
            name: serverDebug ? utils.assetsPath('fonts/[name].[ext]') : utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
    }
].concat(utils.styleLoaders({
    sourceMap: true,
    extract: true
}))

module.exports = {
    entry: entrys,
    output: {
        path: path.resolve(__dirname, ServerPath.path),
        filename: serverDebug ? utils.assetsPath('js/[name].js') : utils.assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: serverDebug ? utils.assetsPath('js/[name].js') : utils.assetsPath('js/[name].[chunkhash].js'),
        publicPath: '/'
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
        rules: rules
    },
    watch: false,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            },
            '__clientMock__': false,
            '__category__': JSON.stringify(process.env.npm_config_category)
        }),
        new ExtractTextPlugin({
            filename: serverDebug ? utils.assetsPath('css/[name].css') : utils.assetsPath('css/[name].[contenthash].css'),
        }),
        new AddCommonScript({
            paths:['/static/common/js/browerVersion.js']
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
