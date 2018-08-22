import 'normalize.css'
import '@common/scss/common.scss'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

if (__clientMock__) {
    const Mock = require('@common/js/mock').default
    /* eslint-disable no-new */
    new Mock({
        mockContext: require.context('./mock', false, /.*\.js/),
        timeout: '200-700', // 模拟ajax返回时间
        parseBody: null,
        arrayFormat: 'traditional' // 解析query方式
    })
}

Vue.use(ElementUI)

const App = require('./app.vue')

/* eslint-disable no-new */
new Vue({
    el: '#app',
    render(h) {
        return h(App)
    },
    components: {
        'app': App
    }
})
