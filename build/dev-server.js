require('./check-versions')()

var config = require('../config')
if(!process.env.NODE_ENV) {
    process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')
var ip = require('ip')
var utils = require('./utils')
var pages = require('./pages')
require('shelljs/global')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: () => {
    }
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
        hotMiddleware.publish({action: 'reload'})
        cb()
    })
})

// proxy api requests
Object.keys(proxyTable).forEach(function(context) {
    var options = proxyTable[context]
    if(typeof options === 'string') {
        options = {target: options}
    }
    app.use(proxyMiddleware(options.filter || context, options))
})

// mock data
if(config.serverMock){
    const bodyParser = require('body-parser')
    const glob = require('glob')
    glob.sync('./mock/**/*.js').forEach((entry) => {
        let mocks = require(utils.resolve(entry))
        !Array.isArray(mocks) && (mocks = [mocks])
        mocks.forEach((mock)=>{
            // console.log(mock)
            if(mock.api){
                app[mock.method](mock.api, mock.response)
            }
        })
    })
    app.use(bodyParser())
}

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = `http://${ip.address()}:${port}/leo_index.html`

var _resolve
var readyPromise = new Promise(resolve => {
    _resolve = resolve
})

app.get('/leo_index.html', function(req, res, next) {
    pages.renderLeoIndex(req, res, next)
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
    console.log('> Listening at ' + uri + '\n')
    // when env is testing, don't need open it
    if(process.env.__LEO__){
        process.stdout.write('__leostart__')
    }else {
        if(autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
            exec(`start ${uri}`)
        }
    }

    _resolve()
})

var server = app.listen(port)

module.exports = {
    ready: readyPromise,
    close: () => {
        server.close()
    }
}
