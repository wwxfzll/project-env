function VueBus (Vue) {
    const bus = new Vue()
    Object.defineProperties(bus, {
        on: {
            get: function () {
                return this.$on
            }
        },
        once: {
            get: function () {
                return this.$once
            }
        },
        off: {
            get: function () {
                return this.$off
            }
        },
        emit: {
            get: function () {
                return this.$emit
            }
        }
    })

    Vue.$leoBus = bus

    Object.defineProperty(Vue.prototype, '$leoBus', {
        get: function () {
            return bus
        }
    })
}

// if (typeof window !== 'undefined' && window.Vue) {
//     window.Vue.use(VueBus)
// }

export default VueBus
