import queryString from './query-string'

export default {
    encode (str) {
        return encodeURI(str)
    },
    getUrlParms (url) {
        if (!url) {
            url = location.search.substring(1) || ''
        } else {
            url = queryString.extract(url)
        }
        return queryString.parse(url)
    },
    dateFormat (format, date) {
        if (!date) {
            date = new Date();
        }
        const o = {
            "y+": date.getYear(), //year
            "M+": date.getMonth() + 1, //month
            "d+": date.getDate(), //day
            "h+": date.getHours(), //hour
            "H+": date.getHours(), //hour
            "m+": date.getMinutes(), //minute
            "s+": date.getSeconds(), //second
            "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
            "S": date.getMilliseconds() //millisecond
        }
        if(/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
        }
        for(let k in o) {
            if(new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
            }
        }
        return format
    },
    getCompatibleDate (dateString) {
        if (this.supportNewDate()) {
            return new Date(dateString.replace(/-/g, '/'))
        } else {
            return new Date(dateString)
        }
    },
    supportNewDate () {
        if ('ActiveXObject' in window) {
            return 'MSIE'
        }
        if (navigator.userAgent.indexOf('Firefox') > 0) {
            return 'Firefox'
        }
        if (navigator.userAgent.indexOf('Safari') > 0) {
            return 'Safari'
        }
        if (navigator.userAgent.indexOf('Camino') > 0) {
            return 'Camino'
        }
    },
    transformTO (tranvalue) {
        try {
            if (tranvalue == '0') {
                return '零元整'
            }
            var i = 1
            var dw2 = new Array('', '万', '亿') // 大单位
            var dw1 = new Array('拾', '佰', '仟') // 小单位
            var dw3 = new Array('分', '角') // 小单位
            var dw = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖') // 整数部分用
            // 以下是小写转换成大写显示在合计大写的文本框中
            // 分离整数与小数
            var source = tranvalue.split('.')
            var num = source[0]
            var dig = source[1]
            // 转换整数部分
            var k1 = 0 // 计小单位
            var k2 = 0 // 计大单位
            var sum = 0
            var str = ''
            var len = source[0].length // 整数的长度
            for (i = 1; i <= len; i++) {
                var n = source[0].charAt(len - i) // 取得某个位数上的数字
                var bn = 0
                if (len - i - 1 >= 0) {
                    bn = source[0].charAt(len - i - 1) // 取得某个位数前一位上的数字
                }
                sum = sum + Number(n)
                if (sum != 0) {
                    str = dw[Number(n)].concat(str) // 取得该数字对应的大写数字，并插入到str字符串的前面
                    if (n == '0') sum = 0
                }
                if (len - i - 1 >= 0) { // 在数字范围内
                    if (k1 != 3) { // 加小单位
                        if (bn != 0) {
                            str = dw1[k1].concat(str)
                        }
                        k1++
                    } else { // 不加小单位，加大单位
                        k1 = 0
                        var temp = str.charAt(0)
                        if (temp == '万' || temp == '亿') // 若大单位前没有数字则舍去大单位
                            { str = str.substr(1, str.length - 1) }
                        str = dw2[k2].concat(str)
                        sum = 0
                    }
                }
                if (k1 == 3) { // 小单位到千则大单位进一
                    k2++
                }
            }
            // 转换小数部分
            var strdig = ''
            if (dig && dig != '') {
                str += '元'
                var n
                var digSize = dig.length, n
                if (digSize > 2) { digSize = 2 }
                for (var q = 0; q < digSize; q++) {
                    n = dig.charAt(q)
                    if (n == 0) { continue }
                    strdig += dw[Number(n)] + dw3[1 - q]
                }
            } else {
                str += '元整'
            }
            str += strdig
        } catch (e) {
            return '零元'
        }
        return str
    },
    // 阿拉伯数字小写转大写
    Arabia_To_SimplifiedChinese (Num) {
        var i, part, newchar = '', tmpnewchar = '', perchar
        for (i = Num.length - 1; i >= 0; i--) {
            Num = Num.replace(',', '')// 替换Num中的“,”
            Num = Num.replace(' ', '')// 替换Num中的空格
        }
        if (isNaN(Num)) { // 验证输入的字符是否为数字
            // alert("请检查小写金额是否正确");
            return
        }
        // 字符处理完毕后开始转换，采用前后两部分分别转换
        part = String(Num).split('.')
        newchar = ''
        // 小数点前进行转化
        for (i = part[0].length - 1; i >= 0; i--) {
            if (part[0].length > 10) {
                // alert("位数过大，无法计算");
                return ''
            }// 若数量超过拾亿单位，提示
            tmpnewchar = ''
            perchar = part[0].charAt(i)
            switch (perchar) {
            case '0':
                tmpnewchar = '零' + tmpnewchar
                break
            case '1':
                tmpnewchar = '一' + tmpnewchar
                break
            case '2':
                tmpnewchar = '二' + tmpnewchar
                break
            case '3':
                tmpnewchar = '三' + tmpnewchar
                break
            case '4':
                tmpnewchar = '四' + tmpnewchar
                break
            case '5':
                tmpnewchar = '五' + tmpnewchar
                break
            case '6':
                tmpnewchar = '六' + tmpnewchar
                break
            case '7':
                tmpnewchar = '七' + tmpnewchar
                break
            case '8':
                tmpnewchar = '八' + tmpnewchar
                break
            case '9':
                tmpnewchar = '九' + tmpnewchar
                break
            }
            switch (part[0].length - i - 1) {
            case 0:
                tmpnewchar = tmpnewchar
                break
            case 1:
                if (perchar != 0) tmpnewchar = tmpnewchar + '十'
                break
            case 2:
                if (perchar != 0) tmpnewchar = tmpnewchar + '百'
                break
            case 3:
                if (perchar != 0) tmpnewchar = tmpnewchar + '千'
                break
            case 4:
                tmpnewchar = tmpnewchar + '万'
                break
            case 5:
                if (perchar != 0) tmpnewchar = tmpnewchar + '十'
                break
            case 6:
                if (perchar != 0) tmpnewchar = tmpnewchar + '百'
                break
            case 7:
                if (perchar != 0) tmpnewchar = tmpnewchar + '千'
                break
            case 8:
                tmpnewchar = tmpnewchar + '亿'
                break
            case 9:
                tmpnewchar = tmpnewchar + '十'
                break
            }
            newchar = tmpnewchar + newchar
        }
        // 替换所有无用汉字，直到没有此类无用的数字为止
        while (newchar.search('零零') != -1 || newchar.search('零亿') != -1 || newchar.search('亿万') != -1 || newchar.search('零万') != -1) {
            newchar = newchar.replace('零亿', '亿')
            newchar = newchar.replace('亿万', '亿')
            newchar = newchar.replace('零万', '万')
            newchar = newchar.replace('零零', '零')
        }
        // 替换以“一十”开头的，为“十”
        if (newchar.indexOf('一十') == 0) {
            newchar = newchar.substr(1)
        }
        // 替换以“零”结尾的，为“”
        if (newchar.lastIndexOf('零') == newchar.length - 1) {
            newchar = newchar.substr(0, newchar.length - 1)
        }
        return newchar
    },
    winOpen (url) {
        try {
            const otherWindow = window.open()
            otherWindow.opener = null
            otherWindow.location = url
        } catch (e) {
            window.open(url)
        }
    },
    getStrByte (str) {
        if (str != null) {
            var cArr = str.match(/[^\x00-\xff]/ig)
            return str.length + (cArr == null ? 0 : cArr.length)
        } else {
            return 0
        }
    },
    closePage (){
        if (navigator.userAgent.indexOf("MSIE") > 0) {
            if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
                window.opener = null; window.close();
            }
            else {
                window.open('', '_top'); window.top.close();
            }
        }
        else if (navigator.userAgent.indexOf("Firefox") > 0) {
            window.location.href = 'about:blank '; //火狐默认状态非window.open的页面window.close是无效的
            //window.history.go(-2);
        }
        else {
            // window.opener = null;
            // window.open('', '_self', '');
            // window.close();
            window.location.href = 'about:blank'
        }
    }
}
