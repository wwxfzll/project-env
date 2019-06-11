var webpack = require('webpack')
var path = require('path')
var pages = require('../build/pages')
var utils = require('../build/utils')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var AddCommonScript = require('../webpackPlugins/addCommonScript')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var vueLoaderConfig = require('../build/vue-loader.conf')

const entrys = pages.entries.getJs()
Object.keys(entrys).forEach(function(name) {
    entrys[name] = [utils.resolve(`build/polyfills.js`)].concat(entrys[name])
})


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


var publicPath = process.env.npm_config_cdn ? 'http://shengshuili.ufile.ucloud.com.cn/' : '/'
module.exports = {
    entry: entrys,
    output: {
        path: path.resolve(__dirname, '../ndist'),
        filename: utils.assetsPath('js/[name].[chunkhash].js'),
        chunkFilename: utils.assetsPath('js/[name].[chunkhash].js'),
        publicPath: publicPath,
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
        new webpack.optimize.UglifyJsPlugin({
            // 最紧凑的输出
            beautify: false,
            // 删除所有的注释
            comments: false,
            compress: {
                // 在UglifyJs删除没有用到的代码时不输出警告
                warnings: false,
                // 删除所有的 `console` 语句，为true会影响console.error函数无法提示错误信息
                // 还可以兼容ie浏览器
                drop_console: false,
                // 内嵌定义了但是只用到一次的变量
                collapse_vars: true,
                // 提取出出现多次但是没有定义成变量去引用的静态值
                reduce_vars: true,
                //移除不需要的函数调用
                pure_funcs: ['console.log']
            },
            sourceMap: true
        }),
        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].[contenthash].css'),
        }),
        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function(module, count) {
                if(checkPath(module)) {
                    return true
                }
                return false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vendor']
        }),
        new AddCommonScript({
            paths:['/static/common/js/browerVersion.js']
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: path.resolve(__dirname, '../ndist/static'),
                ignore: ['.*']
            }
        ])
    ]
}

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

pages.entries.getHtml().forEach((obj)=>{
    module.exports.plugins.push(new HtmlWebpackPlugin({
        filename: obj.filename,
        template: obj.template, //模板路径
        inject: true,
        excludeChunks: obj.excludeChunks
    }))
})
