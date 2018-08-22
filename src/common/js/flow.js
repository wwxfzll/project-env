/**
 * Created by youyiyongheng on 2017-6-26.
 */
import api from '@common/js/api'
import utils from '@common/js/utils'

export default {
    flowCommit (that, action, data) {
        let actionContent = action.actionContent
        let url = actionContent.url
        let name = action.actionName
        return new Promise((resolve, reject) => {
            api.ajax({
                url: url,
                type: 'POST',
                data: data
            }).then((response) => {
                response = utils.getDefalutResponse(response)
                if (response.result) {
                    that.$message({
                        type: 'success',
                        message: name + '成功'
                    })
                    resolve(response)
                } else {
                    that.$message({
                        type: 'info',
                        message: response.msg || name + '失败'
                    })
                    reject(response)
                }
            }).catch((err) => {
                that.$message.error('service' + name + '失败')
                reject(err)
            })
        })
    },
    flowSign (that, action, data) {
        let actionContent = action.actionContent
        let url = actionContent.url
        let name = action.actionName
        return new Promise((resolve, reject) => {
            api.ajax({
                url: url,
                type: 'POST',
                data: data
            }).then((response) => {
                response = utils.getDefalutResponse(response)
                if (response.result) {
                    resolve(response)
                } else {
                    that.$message({
                        type: 'info',
                        message: response.msg || name + '失败'
                    })
                    reject(response)
                }
            }).catch((err) => {
                that.$message.error('service' + name + '失败')
                reject(err)
            })
        })
    },
    getFlowViewAuthority(btns){
        let isHasAuthority = false
        btns.forEach((btn) => {
            if(btn.BNT_CODE === 'show'){
                isHasAuthority = true
            }
        })
        if(!isHasAuthority){
            utils.closePage()
        }
    },
    getFlowActionsDetail(type, simpleActions){
        //判断是否有权限查看
        this.getFlowViewAuthority(simpleActions)
        //过滤查看按钮
        let filterActions = []
        simpleActions.forEach(action => {
            if(action.BNT_CODE !== 'show'){
                filterActions.push(action)
            }
        })
        //请求不同流程JSON
        let flowMap = {
            tp: '/static/entp-purchase/tenderProject/flow.json',
            ter:'/static/entp-purchase/tenderEvalResult/flow.json',
            sn: '/static/entp-purchase/suppleNotice/flow.json',
            ts:'/static/entp-purchase/tenderSignup/flow.json',
        }
        let resultActions = []
        return new Promise((resolve, reject) => {
            api.ajax({
                url: flowMap[type],
                dataType:'json',
            }).then(response => {
                let detailActions = response.actions
                filterActions.forEach(fAction => {
                    detailActions.forEach(dAction => {
                        if(fAction.MENUID === dAction.MENUID && fAction.BNT_CODE === dAction.BNT_CODE){
                            dAction.actionName = fAction.BTN_NAME
                            if(dAction.actionContent.url){
                                dAction.actionContent.url = dAction.actionContent.url + location.search
                            }
                            if(dAction.actionContent.pageUrl){
                                dAction.actionContent.pageUrl = dAction.actionContent.pageUrl + location.search
                            }
                            resultActions.push(Object.assign(fAction, dAction))
                        }
                    })
                })
                resolve(resultActions)
            }).catch((err) => {
                reject(err)
            })
        })

    }
}
