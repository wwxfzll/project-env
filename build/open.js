require('shelljs/global')
var config = require('../config')
var ip = require('ip')

var autoOpenBrowser = !!config.dev.autoOpenBrowser
var port = process.env.PORT || config.dev.port

var uri = `http://${ip.address()}:${port}/leo_index.html`

module.exports = function() {
    if(autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
        exec(`start ${uri}`)
    }
}