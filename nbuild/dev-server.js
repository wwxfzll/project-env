var webpack = require('webpack')
var dev = require('./webpack.dev.config')

console.log('dev start.\n')
webpack(dev, function (err,stats) {
    if(err) throw err
    process.stdout.write(stats.toString({
        colors:true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    })+ '\n')
    var date = new Date()
    console.log(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ' dev conplete.\n')
})
