import mockjs from 'mockjs'
import $ from 'jquery'
import queryString from './query-string'

export default class Mock {
    static defOption = {
        timeout: '200-700',
        mockContext: false,
        parseBody: null,
        arrayFormat: 'traditional'
    }

    constructor (option) {
        this.option = $.extend(true, {}, Mock.defOption, option)
        this.init()
    }

    init () {
        const mockContext = this.option.mockContext
        mockjs.setup({
            timeout: this.option.timeout
        })
        if (mockContext) {
            mockContext.keys().forEach((filename) => {
                this.setupMock(mockContext(filename).default)
            })
        }
    }

    setupMock (mocks) {
        !Array.isArray(mocks) && (mocks = [mocks])
        mocks.filter(mock => !mock.disable).forEach((mock) => {
            mockjs.mock(this.setApi(mock), mock.method.toLocaleLowerCase(), (options) => {
                options.query = this.parseBody(mock, options)
                return mock.response(options)
            })
        })
    }

    parseBody (mock, options) {
        const parseBody = mock.parseBody || this.option.parseBody
        const body = options.body
        if (typeof parseBody === 'function') {
            return parseBody(mock, options)
        } else if (!body) {
            const query = queryString.extract(options.url)
            if (typeof query === 'string') {
                return queryString.parse(query, {
                    arrayFormat: mock.arrayFormat || this.option.arrayFormat
                })
            }
        } else if (typeof body === 'string') {
            return queryString.parse(body, {
                arrayFormat: mock.arrayFormat || this.option.arrayFormat
            })
        }
        return body
    }

    setApi (mock) {
        if (typeof mock.api === 'function') {
            return mock.api()
        } else if (mock.notParseApi) {
            return mock.api
        } else {
            return new RegExp(`${mock.api}(\\?.*|$)`)
        }
    }
}
