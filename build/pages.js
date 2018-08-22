var glob = require('glob')
var fs = require('fs')
var path = require('path')
var utils = require('./utils')

function getEntries(globPath) {
    const entries = [], chunksNames = []
    let tmp, filename, dirname, obj, entryJs, normalizeEntry, dirArr, entryArr
    entryArr = glob.sync(globPath)
    if(entryArr.length === 0) {
        throw new Error('没找到入口文件')
    }
    entryArr.forEach((entry) => {
        normalizeEntry = path.normalize(entry)
        dirname = path.dirname(normalizeEntry)
        entryJs = `${dirname}\\${path.basename(normalizeEntry, '.html')}.js`
        if(fs.existsSync(entryJs)) {
            tmp = dirname.split(path.sep)
            dirArr = tmp.slice(1, -1)
            filename = tmp.slice(-1)[0]
            obj = {
                tmp,
                dirArr,
                filename,
                entry,
                entryJsArr: entryJs.split(path.sep),
                chunksName: `${dirArr.join('/')}/${filename}`
            }
            entries.push(obj)
            chunksNames.push(obj.chunksName)
        }
    })

    return {
        getJs(){
            const jsObj = {}
            entries.forEach((obj) => {
                jsObj[obj.chunksName] = utils.resolve(obj.entryJsArr.join('/'))
            })
            return jsObj
        },
        getHtml(){
            return entries.map((obj) => {
                return {
                    filename: `${obj.chunksName}.html`,
                    template: utils.resolve(obj.entry),
                    favicon: utils.resolve(`${obj.tmp.join('/')}/favicon.ico`),
                    excludeChunks: chunksNames.filter(item => {
                        return (item !== obj.chunksName)
                    })
                }
            })
        }
    }
}

let views = 'views'
const npmConfigViews = process.env.npm_config_views

if(npmConfigViews === 'all') {
    views = '{views,__business__,__components__}'
}else if(npmConfigViews) {
    views = npmConfigViews
}

exports.entries = getEntries(`./src/${views}/**/__leo_index__.html`)

exports.renderLeoIndex = function(req, res, next) {
    const pages = getPages(exports.entries.getHtml())
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8"/>
                <meta content="yes" name="apple-mobile-web-app-capable"/>
                <meta content="yes" name="apple-touch-fullscreen"/>
                <meta content="telephone=no,email=no" name="format-detection"/>
                <title>leo_index</title>
                <style>
                    .content{
                        margin: auto;
                        width: 1200px;
                    }
                    .content .separator{
                        margin: 0 8px;
                        color: #bfcbd9;
                    }
                    .content .crumb{
                        color: #97a8be;
                    }
                    .content .link{
                        color: cadetblue;
                    }
                </style>
            </head>
            <body>
                ${getHtml(pages)}
            </body>
        </html>
    `)
}

function getPages(pages) {
    const allPages = {}
    pages.forEach((page) => {
        const url = page.filename
        const arr = url.split('/')
        const type = arr.slice(0, 1)[0].replace(/__(.*)__/, (str, $1) => {
            return $1
        })
        const midArr = arr.slice(1, -1)
        const html = arr.slice(-1)[0]
        !allPages[type] && (allPages[type] = [])
        allPages[type].push({
            url,
            arr,
            type,
            midArr,
            html
        })
    })
    return allPages
}

function getMidHtml(midArr) {
    let html = ''
    midArr.forEach(item => {
        html += `<span class="crumb">${item}</span><span class="separator">/</span>`
    })
    return html
}

function getHtml(pages) {
    let html = '<div class="content">'
    Object.keys(pages).forEach((key) => {
        const page = pages[key]
        html += `<div><h1>${key}</h1>`
        page.forEach(page => {
            html += `<p>${getMidHtml(page.midArr)}<a href="./${page.url}" class="link">${page.html}</a></p>`
        })
        html += `</div>`
    })
    return html += `</div>`
}