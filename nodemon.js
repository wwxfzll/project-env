var nodemon = require('nodemon')
var open = require('./build/open.js')
let isOpen = false

nodemon({
    script: 'build/dev-server.js',
    // "restartable": "rs",
    "ignore": [
        ".git",
        ".idea",
        "node_modules"
    ],
    // "verbose": true,
    "execMap": {
        "js": "node --max-old-space-size=2048"
    },
    // "events": {
    //     "restart": "osascript -e 'display notification \"App restarted due to:\n'$FILENAME'\" with title \"nodemon\"'"
    // },
    "watch": [
        "build/",
        "config/",
        "mock/",
        "webpackPlugins",
        "scripts"
    ],
    stdout: false,
    "env": {
        "__LEO__": true
    },
    // "ext": "js json"
}).on('stdout', function(data) {
    let dataStr = data.toString().trim()
    if(dataStr.indexOf('__leostart__') > -1) {
        dataStr = dataStr.replace('__leostart__', '')
        if(!isOpen) {
            open()
            isOpen = true
        }
    }
    console.log(dataStr)
}).on('stderr', function(data) {
    console.log(data.toString().trim())
})