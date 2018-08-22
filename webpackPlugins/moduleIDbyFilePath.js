class ModuleIDbyFilePath {
    constructor(options) {
    }
    apply(compiler) {
        compiler.plugin("compilation", (compilation) => {
            compilation.plugin("module-ids", (modules) => {
                modules.forEach((module) => {
                    if(module.id === null) {
                        module.id = module.dependencies[0].module.rawRequest
                    }
                })
            })
        })
    }
}

module.exports = ModuleIDbyFilePath