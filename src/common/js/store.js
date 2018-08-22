import Vue from 'vue'
import _ from 'lodash'

export class Store {
    static defaultOption = {
        initData: {
        },
        watch: {}
    }
    constructor (option) {
        this.option = _.defaultsDeep({}, Store.defaultOption, option)
        this.init()
    }
    init () {
        const option = this.option
        this.vm = new Vue({
            data: {
                $$Leo: option.initData
            },
            watch: option.watch
        })
    }
    getData (key) {
        return this.vm._data.$$Leo[key]
    }
    setData (key, val) {
        if (_.isFunction(val)) {
            val(this.getData(key))
        }
    }
    replaceData (key, val) {
        return this.vm._data.$$Leo[key] = val
    }
    watch (key, cb, option) {
        return this.vm.$watch(function () {
            return this._data.$$Leo[key]
        }, cb, option)
    }
    destroy () {
        this.vm.$destroy()
        this.vm = null
    }
}

let fn = null

export function store (option) {
    if (!fn) {
        fn = new Store(option)
    }
    return fn
}

export function destroyStore () {
    if (fn) {
        fn.destroy()
        fn = null
    }
}
