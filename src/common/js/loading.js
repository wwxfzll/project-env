import $ from 'jquery'

const $loading = $('<div class="el-loading-mask is-fullscreen"><div class="el-loading-spinner"><svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg></div></div>').hide().appendTo('body')

export default {
    show () {
        $loading.show()
    },
    hide () {
        $loading.hide()
    }
}
