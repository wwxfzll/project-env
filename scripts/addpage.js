const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const ejs = require('ejs')
const glob = require('glob')
const del = require('del')

const promps = [
    {
        type: 'list',
        name: 'type',
        message: '类型',
        choices: [
            {
                name: 'pages',
                value: 'pages'
            },
            {
                name: 'business',
                value: 'business'
            },
            {
                name: 'components',
                value: 'components'
            }
        ]
    },
    {
        type: 'input',
        name: 'title',
        message: '请填写title',
        validate: function(input) {
            if(!input) {
                return 'title不能为空'
            }
            return true
        },
        when: function(answers) {
            return answers.type === 'pages'
        }
    },
    {
        type: 'input',
        name: 'pageUrl',
        message: 'pageUrl',
        validate: function(input) {
            if(!input) {
                return 'pageUrl不能为空'
            }
            return true
        }
    },
    {
        type: 'checkbox',
        message: '选择要用的库（多选）',
        name: 'libs',
        choices: [
            {
                name: 'lodash'
            },
            {
                name: 'jquery',
                checked: true
            },
        ]
    }
]

inquirer.prompt(promps).then((option) => {
    if(option.type === 'pages') {
        return copyPage(option).then(ejsMap).then(()=>{
            console.log(chalk.green('请重启服务！'))
        }).catch((error)=>{
            errorLog(error)
        })
    }else if(option.type === 'business') {
        return copyView(option).then(ejsMap).then(()=>{
            console.log(chalk.green('请重启服务！'))
        }).catch((error)=>{
            errorLog(error)
        }).then(()=>{
            return copyModule(option).then(ejsMap)
        }).then(()=>{
            console.log(chalk.green('请重启服务！'))
        }).catch((error)=>{
            errorLog(error)
        })
    }else if(option.type === 'components') {
        return copyView(option).then(ejsMap).then(()=>{
            console.log(chalk.green('请重启服务！'))
        }).catch((error)=>{
            errorLog(error)
        }).then(()=>{
            return copyModule(option).then(ejsMap)
        }).then(()=>{
            console.log(chalk.green('请重启服务！'))
        }).catch((error)=>{
            errorLog(error)
        })
    }
}).then(() => {
    console.log(chalk.green('DONE！'))
}).catch((error) => {
    errorLog(error)
})

function errorLog(error) {
    if(error){
        console.log(chalk.red(error))
    }
}

function copyPage(option) {
    option = Object.assign({}, option)
    option.copyFrom = path.join(__dirname, '..', '/template/page')
    option.copyTo = path.join(__dirname, '../src', `${option.type}/${option.pageUrl}`)
    return checkUrl(option)
}

function checkUrl(option) {
    return open(option.copyTo).then(askUrl).then(() => {
        return copy(option)
    })
}

function askUrl(res) {
    return new Promise((resolve, reject) => {
        if(res.isExists) {
            const promps = [
                {
                    type: 'list',
                    name: 'state',
                    message: `目录(${res.url})已经存在`,
                    choices: [
                        {
                            name: '手动删除',
                            value: 0
                        },
                        {
                            name: '覆盖',
                            value: 1
                        },
                        {
                            name: '删除覆盖',
                            value: 2
                        },
                    ]
                },
            ]
            inquirer.prompt(promps).then((option) => {
                if(option.state === 2) {
                    del([`${res.url}\\**`, `!${res.url}`], {
                        force: true,
                        dot: true
                    }).then(()=>{
                        resolve()
                    }).catch((err)=>{
                        reject(err)
                    })
                }else if(option.state === 1){
                    resolve()
                }else{
                    reject(`目录(${res.url})请手动删除`)
                }
            })
        }else {
            resolve()
        }
    })
}

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

function copyView(option) {
    option = Object.assign({}, option)
    option.copyFrom = path.join(__dirname, '..', `/template/${option.type}/view`)
    option.copyTo = path.join(__dirname, '../src', `__${option.type}__/${option.pageUrl}`)
    setOption(option)
    return checkUrl(option)
}

function copyModule(option) {
    option = Object.assign({}, option)
    option.copyFrom = path.join(__dirname, '..', `/template/${option.type}/module`)
    option.copyTo = path.join(__dirname, '../src', `${option.type}/${option.pageUrl}`)
    setOption(option)
    return checkUrl(option)
}

function setOption(option) {
    const mUrl = `${option.type}/${option.pageUrl}`
    const mDirArr = mUrl.split('/')
    const mDirName = mDirArr.slice(-1)[0]
    const vueName = `wce-${mDirName}`
    const mName = setMName(vueName)
    const mDir = `${mDirArr.slice(0, -1).join('/')}/${mDirName}`
    option.vueName = vueName
    option.mDirName = mDirName
    option.mName = mName
    option.mDir = mDir
}

function setMName(str) {
    return str.split('-').map((item) => {
        return item.replace(/^(\w){1}(.*)/, ($0, $1, $2) => {
            return $1.toUpperCase() + $2
        })
    }).join('')
}

function ejsMap(option) {
    const entryArr = glob.sync(`${option.copyTo}/**/*.ejs`).map((entry) => {
        option.ejsEntry = entry
        return ejsFn(option)
    })
    return Promise.all(entryArr)
}

function ejsFn(option) {
    option = Object.assign({}, option)
    return rename(option).then(wirteEjs)
}

function rename(option) {
    return new Promise((resolve, reject) => {
        const basename = path.basename(option.ejsEntry).replace('.ejs', '')
        const dirName = path.dirname(option.ejsEntry)
        const url = `${dirName}/${basename}`
        fs.rename(option.ejsEntry, url, (err) => {
            if(err) {
                reject(err)
            }else {
                option.rename = {
                    url,
                    basename,
                    dirName
                }
                resolve(option)
            }
        })
    })
}

function wirteEjs(option) {
    return fs.readFile(option.rename.url, 'utf8').then((html) => {
        html = ejs.render(html, option)
        return fs.outputFile(option.rename.url, html)
    })
}

