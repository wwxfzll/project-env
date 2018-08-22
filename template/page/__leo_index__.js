import 'normalize.css'
import '@common/scss/common.scss'
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

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
