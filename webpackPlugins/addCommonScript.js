/**
 * Created by youyiyongheng on 2017-7-30.
 */
class AddCommonScript {
    constructor (options) {
        this.options = options
    }
    apply (compiler) {
        let paths = this.options.paths
        compiler.plugin('compilation', (compilation, options) => {
            compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, callback) => {
                paths.forEach((path) => {
                    htmlPluginData.assets.js.unshift(path)
                })
                callback(null, htmlPluginData)
            })
        })
    }
}

module.exports = AddCommonScript
