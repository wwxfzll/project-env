require('./check-versions')()

process.env.NODE_ENV = 'production'

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var webpackConfig = require('./webpack.prod.conf')
var pages = require('./pages')

var spinner = ora('building for production...')
spinner.start()

var express = require('express')
var ip = require('ip')
var utils = require('./utils')
require('shelljs/global')

function appOpen() {
    var app = express()
    var port = process.env.PORT || config.dev.port
    app.use(express.static('./dist'))
    app.get('/leo_index.html', function(req, res, next) {
        pages.renderLeoIndex(req, res, next)
    })

    app.listen(port)
    const uri = `http://${ip.address()}:${port}/leo_index.html`
    exec(`start ${uri}`)
}

var fs = require('fs')
var archiver = require('archiver')
var pkg = require('../package.json')

function supplementaries(num) {
    if(num < 10){
        return '0' + num
    }
    return num
}

function formatDate(now) {
    var year = String(now.getFullYear())
    var month = String(supplementaries(now.getMonth() + 1))
    var date = String(supplementaries(now.getDate()))
    var hour = String(supplementaries(now.getHours()))
    var minute = String(supplementaries(now.getMinutes()))
    var second = String(supplementaries(now.getSeconds()))
    return year + month + date + hour + minute + second
}

function zip() {
    var archive = archiver('zip')
    var output = fs.createWriteStream(utils.resolve(`zip/${pkg.name}-${formatDate(new Date())}.zip`))
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('压缩完成!')
        exec('explorer ' + 'zip')
    })
    archive.on('error', function(err) {
        throw err
    })
    archive.pipe(output)
    archive.directory('dist/')
    archive.finalize()
}

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
    if(err) throw err
    webpack(webpackConfig, function(err, stats) {
        spinner.stop()
        if(err) throw err
        process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n\n')

        console.log(chalk.cyan('  Build complete.\n'))
        console.log(chalk.yellow(
            '  Tip: built files are meant to be served over an HTTP server.\n' +
            '  Opening index.html over file:// won\'t work.\n'
        ))
        config.build.zip && zip()
        !config.build.noOpen && appOpen()
    })
})
