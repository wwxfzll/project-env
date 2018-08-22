# multiPage vue

> A multiPage Vue project

## Build Setup

``` bash
npm install yarn -g

yarn config set sass-binary-site http://npm.taobao.org/mirrors/node-sass

# 安装
yarn install

# dev环境
npm run dev

#dev serverMock环境
npm run dev:serverMock

#dev clientMock环境
npm run dev:clientMock

#清除dist
npm run clean

#addpage
npm run addpage

# 生产环境
npm run build

# zip
npm run zip

# 生成环境生成报告
npm run build --report

##更新
yarn install --force
```

##多页面路径说明

src/views/a/b/c.html => src/views/a/b/c/__leo_index__.html（只能在views下创建，目录下必须有__leo_index__.html,__leo_index__.js这2个文件，模版可以拷贝template下index,文件夹名称就是编译后的html名称）


##mock  ([mock文档](http://mockjs.com/))

服务端模拟：npm run dev:serverMock，编辑mock下的index文件[expressjs文档](http://expressjs.com/)


客服端模拟：npm run dev:clientMock，编辑每个页面下的mock文件，具体调用名称可以看template下的mock文件

##别名

```javascript

'@' -> src
'@assets' -> src/assets
'@components' -> src/components
'@views' -> src/views
'@common' -> src/common
'@lib' -> src/lib
'@business' -> src/business

```
可以直接引用

##js工具

lodash: [文档](https://lodash.com/)；
element: [文档](http://element.eleme.io/#/zh-CN)
vue: [文档](http://cn.vuejs.org/)
sass: [文档](http://sass.bootcss.com/)
jquery: [文档](http://www.css88.com/jqapi-1.9/)


##规范
- 1 文件命名统一用小写加-（比如xxx-xxx-xxx）
- 2 使用 4 个空格做为一个缩进层级，不允许使用 2 个空格 或 tab 字符，格式化
- 3 [vue代码规范](https://pablohpsilva.github.io/vuejs-component-style-guide/#/chinese)
(业务组件和通用组件全部以wce作为命名空间，组件名统一用小写加-，组件要加上name属性用大驼峰写法，在HTML模版中始终使用 kebab-case,通用组件style不加scoped属性，css要加命名空间)
- 4 [js代码规范](https://github.com/fex-team/styleguide/blob/master/javascript.md)(尽量用es6的写法写)
- 5 [css代码规范](https://github.com/fex-team/styleguide/blob/master/css.md)（尽量用class表示，用小写加-）
- 6 [html代码规范](https://github.com/fex-team/styleguide/blob/master/html.md)

##目录规范

- 1 src/views 必须都是页面相关代码
- 2 src/assets 全局资源文件（不能擅自改动，有需求找相关维护人员）
- 3 src/components 全局VUE通用组件库（不能擅自改动，有需求找相关维护人员）
- 4 src/business 全局VUE业务组件库（不能擅自改动，有需求找相关维护人员）
- 5 src/common 全局公用代码（不能擅自改动，有需求找相关维护人员）
- 6 src/lib 引用lib（不能擅自改动，有需求找相关维护人员）
- 7 mock 服务端mock文件

其他文件不能擅自改动，有需求找相关维护人员
