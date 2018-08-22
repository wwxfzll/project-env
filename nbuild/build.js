var webpack = require('webpack')
var prov = require('./webpack.xyxx.config')

console.log('production start.\n')
webpack(prov, function (err,stats) {
    if(err) throw err
    process.stdout.write(stats.toString({
            colors:true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        })+ '\n')
    var date = new Date()
    console.log(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ' production conplete.\n')
})
