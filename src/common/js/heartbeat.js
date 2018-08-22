/**
 * Created by youyiyongheng on 2017-7-30.
 */
import $ from 'jquery'

// 间隔10分钟发送一次
setInterval(function () {
    return false
    // $.ajax({
    //     url: '/Home/HeartBeat?ieTime=' + new Date().getTime(),
    //     type: 'get'
    // })
}, 10 * 60000)
