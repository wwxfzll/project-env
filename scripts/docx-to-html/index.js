var mammoth = require('mammoth')
var fs = require('fs')
var glob = require('glob')
var path = require('path')
var mkdir = require('mkdir-p')
var beautify_html = require('js-beautify').html

var config = {
    fileDir: './docx',
    outputDir: './html',
    head: '<div class="content">',
    footer: '</div>'
}

var fileDir
var outputDir
var imgDir
var imageIndex = 0

function parseHtmlResultValue(value) {
    return replaceTextVal(value)
}

function prop() {

}

function replaceTextVal(value) {
    return value.replace(/([A-Z]+[A-Z\_]+)/g, function(all, input1, input2, input3, input4) {
        console.log(input1)
        return `{{res.${input1}}}`
    }).replace(/_{2,}/g, '')
}

function replaceLeoClass(value) {
    var name = '__leotext__ '
    var reS = /(\S)/g
    return value.replace(getRe(name), function(all, input1, input2, input3, input4) {
        if(reS.test(input4)) {
            // console.log(input4)
            return input4
        }else {
            return '<el-form-item prop=""><el-input v-model=""></el-input></el-form-item>'
        }
    })
}

function getRe(name) {
    return new RegExp('((\\<input[^\\>]*(' + name + ')[^\\>]*)\\>([^\\<input\\>]*)\\<\/input\\>)', 'g')
}

var covertHTML = (exports.covertHTML = function(file, outputPath, basename) {
    mammoth.convertToHtml(
        {
            path: file
        },
        {
            convertImage: mammoth.images.inline(function(element) {
                return element.read('base64').then(function(imageBuffer) {
                    imageIndex++
                    var extname = element.contentType.replace('image/', '')
                    var data = new Buffer(imageBuffer, 'base64')
                    var imagePath = path.join(
                        imgDir,
                        basename,
                        imageIndex + '.' + extname
                    )
                    fs.createWriteStream(imagePath).write(data)
                    return {
                        src: imagePath
                    }
                })
            }),
            transformDocument: mammoth.transforms.paragraph(
                function transformParagraph(element) {
                    // console.log(JSON.stringify(element, null, 4))
                    // console.log('---------------------')
                    if(element.children) {
                        element.children.forEach(elem => {
                            if(elem.type === 'bookmarkStart') {
                                elem.type = null
                            }
                        })
                    }
                    return element
                }
            ),
            styleMap: [
                // 'u => span.u',
                'b => div.strong',
                'p:unordered-list(1) => div.unordered1:fresh',
                'p:unordered-list(2) => div.unordered2:fresh',
                'p:unordered-list(3) => div.unordered3:fresh',
                'p:unordered-list(4) => div.unordered4:fresh',
                'p:unordered-list(5) => div.unordered5:fresh',
                'p:ordered-list(1) => div.order1:fresh',
                'p:ordered-list(2) => div.order2:fresh',
                'p:ordered-list(3) => div.order3:fresh',
                'p:ordered-list(4) => div.order4:fresh',
                'p:ordered-list(5) => div.order5:fresh'
            ]
        }
    ).then(function(result) {
        var outputStream = outputPath
            ? fs.createWriteStream(outputPath)
            : process.stdout
        var resultValue = parseHtmlResultValue(result.value)
        // console.log(resultValue)
        outputStream.write(config.head + resultValue + config.footer)
        fs.readFile(outputPath, 'utf8', function(err, data) {
            if(err) {
                return console.log('readfile', err)
            }
            fs.writeFile(
                outputPath,
                beautify_html(data, {indent_size: 4})
            )
            console.log('[DONE] ', file)
        })
    })
})

function run(options) {
    options = options || {}
    config.fileDir = options.fileDir || config.fileDir
    config.outputDir = options.outputDir || config.outputDir
    config.head = options.head || config.head
    config.footer = options.footer || config.footer
    fileDir = path.join(__dirname, config.fileDir)
    outputDir = path.join(__dirname, config.outputDir)

    glob.sync(fileDir + '/*.docx').forEach(function(file, index) {
        var basename = path.basename(file).split('.')[0]
        var outputPath = path.join(outputDir, basename + '.html')
        imgDir = path.join(outputDir, 'img')
        mkdir.sync(path.join(imgDir, basename))
        covertHTML(file, outputPath, basename)
    })
}

run()

