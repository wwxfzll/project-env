export default {
    mobile: /1\d{10}/, // 中国大陆手机号码
    telephone: /(\d{4}-|\d{3}-)?(\d{8}|\d{7})/, // 中国大陆固定电话号码
    number: /^\d+(\.\d+)?$/, // 数字
    integer: /^\d+$/, // 整数
    zipCode: /^[0-9]{6}$/, // 邮政编码
    price:/^\d+(\.\d{1,2})?$/,//应不超过两位小数
    tariff:/^(\d?\d(\.\d*)?|100)$/,//0到100的数包括小数
    positiveInt:/^[1-9]*[1-9][0-9]*$/,//正整数
    // 小数点保留位数
    decimal (n = 4) {
        return new RegExp(`^[0-9]+\\.[0-9]{${n}}$`)
    }
}
