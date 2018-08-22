import Mock from 'mockjs'

export default [
    {
        api: 'index',
        method: 'get',
        // disable: true,//禁用
        // notParseApi: true,//直接拦截确定的url
        // arrayFormat: 'none',//解析query方式
        // parseBody(mock, options){
        //     return options
        // },
        response(option) {
            const data = Mock.mock({
                "number|+1": 23433
            })
            return {
                json: {},
                msg: "",
                result: true,
            }
        }
    },
]