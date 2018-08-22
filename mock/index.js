const Mock = require('mockjs')

module.exports = [
    {
        api: '/index',
        method: 'get',
        response: function(req, res) {
            const data = Mock.mock({
                "number|+1": 23342
            })
            res.json({
                data: data
            })
        }
    },
    {
        api: '/index',
        method: 'post',
        response: function(req, res) {
            const data = Mock.mock({
                "number|+1": 23433
            })
            res.json({
                data: data,
                body: req.body
            })
        }
    }
]