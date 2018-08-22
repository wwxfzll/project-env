import $ from 'jquery'
import loading from '@common/js/loading'

const $doc = $(document)

$doc.ajaxStart(function () {
    loading.show()
})

$doc.ajaxStop(function () {
    loading.hide()
})

// $doc.ajaxSuccess(function(event, request, settings) {
//     const response = JSON.parse(request.responseText)
//     // if(response.r_code != 0) {
//     //     alert(response.r_msg)
//     // }
// })

$doc.ajaxError(function (event, jqxhr, settings, thrownError) {
    if (jqxhr.status === 401) {
        location.href = 'http://' + location.host
    } else if (jqxhr.status > 300) {
        let logId = jqxhr.getResponseHeader('logId')
        alert('请重新在试，若不行请联系客服，代码' + jqxhr.status + '，logId：' + logId)
        // alert('服务器错误')
    }
})

const ajaxOp = {
    data: {},
    url: '',
    host: '',
    other: {
        // dataType: 'json',
        // method: 'GET'
    }
}

if (__clientMock__) {
    // ajaxOp.host = 'http://192.168.131.151:3800'
    // ajaxOp.host = 'http://localhost:2890'
} else if (process.env.NODE_ENV === 'development') {
    // ajaxOp.host = 'http://localhost:3800'
    // 伟财的 代理接口
    ajaxOp.host = 'http://192.168.118.154:9007'
    // 兆龙的 信息申报接口
    // ajaxOp.host = 'http://218.66.66.53:5000'
    //  ajaxOp.host = 'http://localhost:4100'
} else {
    ajaxOp.host = ''
}
//
export default {
    ajax (option) {
        return new Promise((resolve, reject) => {
            const data = $.extend({}, ajaxOp.data, option.data)
            if (option.host) {
                option.url = option.host + option.url
            } else {
                option.url = ajaxOp.host + option.url
            }
            // 解决ie请求缓存
            let ieTime = 'ieTime=' + new Date().getTime()
            if (option.url.indexOf('?') >= 0) {
                ieTime = '&' + ieTime
            } else {
                ieTime = '?' + ieTime
            }
            option.url = option.url + ieTime

            // 为了让服务端或IIS更好解决跨域问题，静态JSON文件不加withCredentials
            if (option.url.indexOf('.json') < 0) {
                option.xhrFields = {
                    withCredentials: true
                }
            }

            option.data = data
            // option.crossDomain = true
            $.extend(option, ajaxOp.other)
            // console.log(option)
            $.ajax(option).done((...arg) => {
                resolve(...arg)
            }).fail((...arg) => {
                reject(...arg)
            })
        })
    }
}
