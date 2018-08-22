const path = require('path')
const fs = require('fs-extra')

const copyFrom = path.join(__dirname, '../', '/dist')
const copyTo = path.join(__dirname, '../../../xyxx/xyxx.Web/wwwroot', '/')
const uumCopyTo = path.join(__dirname, '../../../ssl-uum/ssl.web/web', '/')

function open(url) {
    return new Promise((resolve, reject) => {
        fs.open(url, 'r', (err) => {
            if(err) {
                resolve({
                    isExists: false,
                    url
                })
                return
            }
            resolve({
                isExists: true,
                url
            })
        })
    })
}

function copy(option) {
    return new Promise((resolve, reject) => {
        fs.copy(option.copyFrom, option.copyTo, {
            overwrite: false,
            errorOnExist: false,
        }).then(() => {
            return resolve(option)
        }).catch(err => {
            return reject(err)
        })
    })
}

const movePath = process.env.npm_config_movepath
if (movePath === 'uum') {
    copy({
        copyFrom: copyFrom,
        copyTo: uumCopyTo
    }).then((res)=>{
        console.log(res)
    }).catch((err)=>{
        console.error(err)
    })
} else {
    copy({
        copyFrom,
        copyTo
    }).then((res)=>{
        console.log(res)
    }).catch((err)=>{
        console.error(err)
    })
}






