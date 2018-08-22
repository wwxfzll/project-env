!(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory)
    } else if (typeof exports === 'object') {
        module.exports = factory()
    } else {
        root.LeoVerification = factory()
    }
})(this, function () {
    'use strict'
    var LeoVerification = (function LeoVerification () {
        'use strict'
        var INITPASS = null
        var INITMSG = ''
        var INITALLMSG = function INITALLMSG () {
            return []
        }

        function every () {
            var len = arguments.length,
                i = 0
            for (; i < len; i++) {
                if (typeof arguments[i] !== 'undefined') {
                    return arguments[i]
                }
            }
        }

        function copyProp (from, to) {
            for (var key in from) {
                to[key] = from[key]
            }
            return to
        }

        var typeRegex = /^\[object |]$/gi

        function type (something) {
            return Object.prototype.toString
            .call(something)
            .replace(typeRegex, '')
            .toLocaleLowerCase()
        }

        function errorRule (option, next) {
            next({
                pass: false,
                msg: 'key:' + option.key + '没有rule'
            })
        }

        function Arraypush (arr, arr1) {
            return Array.prototype.push.apply(arr, arr1)
        }

        function once (fn) {
            var called = false
            return function (setCall) {
                if (setCall === '__leoSetCall__') {
                    fn = null
                }
                fn && fn.apply(null, arguments)
                if (!called) {
                    called = true
                    fn = null
                }
            }
        }

        function triggerResets (resetMap) {
            for (var prop in resetMap) {
                if (resetMap.hasOwnProperty(prop)) {
                    resetMap[prop] && resetMap[prop]()
                }
            }
        }

        function copyOption (option, defaulRuleOption, ruleOption) {
            option = copyProp(option, {
                defaultMsg: defaulRuleOption.msg,
                msg: ruleOption.msg
            })
            if (!option.result) {
                option = copyProp(option, {
                    pass: INITPASS,
                    msg: INITMSG,
                    allMsg: INITALLMSG(),
                    key: option.key,
                    val: option.val
                })
            }
            return option
        }

        function createDefaultRule (defaulRuleOption) {
            defaulRuleOption = defaulRuleOption || {}
            return function (ruleOption) {
                ruleOption = ruleOption || {}
                return function (option, next) {
                    var fn = every(
                        ruleOption.rule,
                        defaulRuleOption.rule,
                        errorRule
                        ),
                        _reset = false,
                        result = {
                            pass: INITPASS,
                            msg: INITMSG
                        },
                        ruleOp = copyOption(
                            option,
                            defaulRuleOption,
                            ruleOption
                        )
                    fn(ruleOp, function (res) {
                        var message = INITMSG
                        if (_reset) {
                            return
                        }
                        result.pass = true
                        if (res === false) {
                            message = every(
                                ruleOption.msg,
                                defaulRuleOption.msg,
                                ''
                            )
                            if (type(message) === 'function') {
                                message = message(
                                    copyOption(
                                        option,
                                        defaulRuleOption,
                                        ruleOption
                                    )
                                )
                            }
                            result.pass = false
                            result.msg = message
                        } else if (res && res.pass === false) {
                            result.pass = false
                            result.msg = res.msg
                        }
                        if (!option.result) {
                            result.allMsg = INITALLMSG()
                            result.key = option.key
                            result.val = option.val
                        }
                        next(result)
                    })
                    return function reset () {
                        _reset = true
                        if (type(ruleOp.__leoStop) === 'function') {
                            ruleOp.__leoStop()
                            delete ruleOp.__leoStop
                        }
                        result.isReset = true
                        next(result)
                    }
                }
            }
        }

        function mergerChildRes (res, result) {
            if (res.childRes) {
                if (result.childRes) {
                    Arraypush(result.childRes, res.childRes)
                } else {
                    result.childRes = res.childRes
                }
            }
        }

        function applyArrAsync (array, data, callback, checkAll) {
            var result = {
                pass: INITPASS,
                msg: INITMSG,
                allMsg: INITALLMSG(),
                key: data.key,
                val: data.val
            }
            if (!array || !array.length) {
                return callback.call(null, result)
            }

            var i = 0,
                _reset = false,
                resetMap = {},
                innerCallback = copyProp(callback, function next (res) {
                    if (_reset) {
                        return
                    }
                    deleteResetMap(resetMap, 'innerCallback' + i)
                    setPass(result, res)
                    if (res.allMsg) {
                        Arraypush(result.allMsg, res.allMsg)
                    } else {
                        result.allMsg.push(res.msg)
                    }
                    mergerChildRes(res, result)
                    if (result.pass === false) {
                        result.msg = res.msg
                        if (!checkAll) {
                            return callback.call(null, result)
                        }
                    }
                    i++
                    if (i >= array.length) {
                        return callback.call(null, result)
                    }
                    setResetMap(
                        i,
                        array[i],
                        copyProp(data, { result: result }),
                        resetMap,
                        innerCallback
                    )
                })
            setResetMap(
                i,
                array[i],
                copyProp(data, { result: result }),
                resetMap,
                innerCallback,
                true
            )

            return function reset () {
                _reset = true
                triggerResets(resetMap)
                resetMap = null
                result.isReset = true
                callback.call(null, result)
            }
        }

        function setResetMap (
            i,
            ruleCb,
            option,
            resetMap,
            innerCallback,
            isInitAllMsg
        ) {
            if (ruleCb instanceof LeoVerification) {
                var result = {
                    pass: INITPASS,
                    msg: INITMSG,
                    key: option.key,
                    val: option.val
                }
                isInitAllMsg && (result.allMsg = INITALLMSG())
                resetMap[
                'innerCallback' + i
                    ] = ruleCb.verify(option.val, function (res) {
                        result.childRes = [res]
                        result.msg = res.msg
                        result.pass = res.pass
                        innerCallback(result)
                    })
            } else {
                resetMap['innerCallback' + i] = ruleCb.call(
                    null,
                    option,
                    innerCallback
                )
            }
        }

        function setPass (result, res) {
            if (result.pass === false) {
                return
            }
            result.pass = res.pass
        }

        function applyRuleParallelAsync (rules, data, callback, checkAll) {
            var result = {
                pass: INITPASS,
                msg: INITMSG,
                verifyData: []
            }
            if (!rules || !rules.length) {
                return callback.call(null, result)
            }
            var i = 0,
                innerCallback,
                resetMap = {},
                remaining = rules.length,
                currIndex = -1

            for (; i < rules.length; i++) {
                innerCallback = (function (index) {
                    return copyProp(callback, function next (res) {
                        if (remaining < 0) return
                        deleteResetMap(resetMap, 'innerCallback' + index)
                        if (checkAll) {
                            result.verifyData[index] = res
                        } else {
                            result.verifyData.push(res)
                        }
                        setPass(result, res)
                        if (result.pass === false) {
                            if (!checkAll) {
                                result.msg = res.msg
                                remaining = -1
                                var resCb = callback.call(null, result)
                                triggerResets(resetMap)
                                resetMap = null
                                return resCb
                            } else {
                                if (currIndex < index) {
                                    result.msg = res.msg
                                    currIndex = index
                                }
                            }
                        }

                        remaining--
                        if (remaining === 0) {
                            return callback.call(null, result)
                        }
                    })
                })(i)

                setResetMap(
                    i,
                    rules[i].rule,
                    setRuleOption(i, data, rules, checkAll),
                    resetMap,
                    innerCallback,
                    true
                )

                if (remaining < 0) break
            }
            return function reset () {
                remaining = -1
                triggerResets(resetMap)
                resetMap = null
                result.isReset = true
                callback.call(null, result)
            }
        }

        function deleteResetMap (resetMap, name) {
            resetMap[name] = null
        }

        function applyRuleAsync (rules, data, callback, checkAll) {
            var result = {
                pass: INITPASS,
                msg: INITMSG,
                verifyData: []
            }
            if (!rules || !rules.length) {
                return callback.call(null, result)
            }
            var i = 0,
                _reset = false,
                resetMap = {},
                innerCallback = copyProp(callback, function next (res) {
                    if (_reset) {
                        return
                    }
                    deleteResetMap(resetMap, 'innerCallback' + i)
                    result.verifyData.push(res)
                    setPass(result, res)
                    if (result.pass === false) {
                        result.msg = res.msg
                        if (!checkAll) {
                            return callback.call(null, result)
                        }
                    }
                    i++
                    if (i >= rules.length) {
                        return callback.call(null, result)
                    }
                    setResetMap(
                        i,
                        rules[i].rule,
                        setRuleOption(i, data, rules, checkAll),
                        resetMap,
                        innerCallback,
                        true
                    )
                })
            setResetMap(
                i,
                rules[i].rule,
                setRuleOption(i, data, rules, checkAll),
                resetMap,
                innerCallback,
                true
            )

            return function reset () {
                _reset = true
                triggerResets(resetMap)
                resetMap = null
                result.isReset = true
                callback.call(null, result)
            }
        }

        function setRuleOption (i, data, rules, checkAll) {
            return {
                index: i,
                val: data[rules[i].key],
                key: rules[i].key,
                ruleItem: rules[i],
                rules: rules,
                data: data,
                isVerifyOne: false,
                checkAll: !!checkAll
            }
        }

        function combineRulesAsync (checkAll) {
            var arg = Array.prototype.slice.call(arguments)
            return function (option, next) {
                var innerCheckAll
                if (typeof checkAll === 'boolean') {
                    arg.shift()
                    innerCheckAll = checkAll
                } else {
                    innerCheckAll = option.checkAll
                }
                return applyArrAsync(arg, option, next, innerCheckAll)
            }
        }

        function getRuleByKey (rules, key) {
            var len = rules.length,
                i = 0,
                item
            for (; i < len; i++) {
                item = rules[i]
                if (item.key === key) {
                    return item
                }
            }
        }

        var defaultRules = {}

        function LeoVerification (option) {
            this.option = copyProp(option, {
                rules: [],
                checkAll: false,
                parallel: false
            })
        }

        !(function (LP, L) {
            LP.verifyOne = function (key, val, cb) {
                var option = this.option,
                    data = {},
                    ruleItem = getRuleByKey(option.rules, key),
                    resetCb = null,
                    ruleCb
                type(option.beforeVerify) === 'function' &&
                option.beforeVerify()
                data[key] = val
                if (ruleItem) {
                    ruleCb = ruleItem.rule
                    if (ruleCb instanceof LeoVerification) {
                        resetCb = ruleCb.verify(val, function (res) {
                            type(option.afterVerify) === 'function' &&
                            option.afterVerify()
                            var result = {
                                pass: res.pass,
                                msg: res.msg,
                                key: key,
                                allMsg: INITALLMSG(),
                                val: val,
                                childRes: [res]
                            }
                            type(cb) === 'function' && cb(result)
                        })
                    } else {
                        resetCb = once(
                            ruleCb(
                                {
                                    index: 0,
                                    val: val,
                                    key: key,
                                    ruleItem: ruleItem,
                                    rules: option.rules.slice(),
                                    data: data,
                                    isVerifyOne: true,
                                    checkAll: option.checkAll
                                },
                                once(function (res) {
                                    if (resetCb) {
                                        resetCb('__leoSetCall__')
                                        resetCb = null
                                    }
                                    type(option.afterVerify) === 'function' &&
                                    option.afterVerify()
                                    type(cb) === 'function' && cb(res)
                                })
                            )
                        )
                    }
                    return resetCb
                } else {
                    console.error('没有 rule')
                }
            }

            LP.verify = function (data, cb) {
                var option = this.option,
                    rules = option.rules,
                    resetCb = null
                if (data) {
                    rules = rules.slice()
                    type(option.beforeVerify) === 'function' &&
                    option.beforeVerify()
                    if (option.parallel) {
                        resetCb = once(
                            applyRuleParallelAsync(
                                rules,
                                data,
                                once(function (res) {
                                    if (resetCb) {
                                        resetCb('__leoSetCall__')
                                        resetCb = null
                                    }
                                    type(option.afterVerify) === 'function' &&
                                    option.afterVerify()
                                    type(cb) === 'function' && cb(res)
                                }),
                                option.checkAll
                            )
                        )
                    } else {
                        resetCb = once(
                            applyRuleAsync(
                                rules,
                                data,
                                once(function (res) {
                                    if (resetCb) {
                                        resetCb('__leoSetCall__')
                                        resetCb = null
                                    }
                                    type(option.afterVerify) === 'function' &&
                                    option.afterVerify()
                                    type(cb) === 'function' && cb(res)
                                }),
                                option.checkAll
                            )
                        )
                    }
                    return resetCb
                }
            }

            L.setDefaultRules = function (option) {
                type(option) !== 'array' && (option = [option])
                var len = option.length,
                    i = 0,
                    item
                for (; i < len; i++) {
                    item = option[i]
                    if (
                        typeof defaultRules[item.name] !== 'undefined' &&
                        !item.cover
                    ) {
                        console.error(item.name + '已存在!')
                        continue
                    }
                    defaultRules[item.name] = createDefaultRule({
                        msg: item.msg,
                        rule: item.rule
                    })
                }
            }

            L.setDefaultRules([
                {
                    name: 'required',
                    msg: function (option) {
                        return option.key + '必填'
                    },
                    rule: function (option, next) {
                        next(
                            typeof option.val !== 'undefined' &&
                            option.val !== ''
                        )
                    }
                },
                {
                    name: 'equal11',
                    msg: function (option) {
                        return option.key + '必须为11位'
                    },
                    rule: function (option, next) {
                        next(option.val.length && option.val.length === 11)
                    }
                },
                {
                    name: 'isEmail',
                    msg: function (option) {
                        return '不是有效邮箱'
                    },
                    rule: function (option, next) {
                        var isEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(option.val)
                        next(isEmail)
                    }
                }
            ])

            L.getDefaultRules = function () {
                return defaultRules
            }

            L.createRule = createDefaultRule()

            L.combineRulesAsync = combineRulesAsync
        })(LeoVerification.prototype, LeoVerification)

        return LeoVerification
    })()
    return LeoVerification
})
