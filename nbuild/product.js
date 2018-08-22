var webpack = require('webpack')
var prov = require('./webpack.prod.config')
var rm = require('rimraf')
var path = require('path')

rm(path.resolve(__dirname, '../ndist'), err => {
    if (err) throw err
    console.log('production start.\n')
    webpack(prov, function (err, stats) {
        if (err) throw err
        process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + '\n')
        var date = new Date()
        console.log(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ' production conplete.\n')
    })
})

