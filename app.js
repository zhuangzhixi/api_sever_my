// 导入 express 模块
const express = require('express')
// 创建 express 的服务器实例
const app = express()
const joi = require('joi')
app.use(express.static('public'));
// 导入并注册 cors 中间件
const cors = require('cors')
app.use(cors())

// 配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件
app.use(express.urlencoded({ extended: false }))



// 响应数据的中间件，一定要在路由之前，封装一个 res.cc 函数
app.use(function (req, res, next) {
    // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = function (err, status = 1) {
        res.send({
            // 状态
            status,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})

// 导入并注册用户路由模块
const classRouter = require('./router/class')
const userRouter = require('./router/user')
app.use('/api', classRouter)
app.use('/api', userRouter)

// 错误中间件
app.use(function (err, req, res, next) {
    // 数据验证失败
    if (err instanceof joi.ValidationError) return res.cc(err)
    //在express中，不允许连续两次调用res.send()
    // 未知错误
    res.cc(err)
})

// write your code here...
// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(3007, function () {
    console.log('api server running at http://127.0.0.1:3007')
})

