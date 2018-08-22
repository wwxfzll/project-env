/**
 * Created by youyiyongheng on 2017-7-13.
 */
if (!function () {}.bind) {
    Function.prototype.bind = function (context) {
        var self = this
        var contextArgs = Array.prototype.slice.call(arguments)

        return function () {
            var curArgs = Array.prototype.slice.call(arguments)
            var args = contextArgs.slice(1).concat(curArgs)
            return self.apply(context, args)
        }
    }
}
