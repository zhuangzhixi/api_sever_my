const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const user_handler = require('../router_handler/user')

router.post('/user/token', user_handler.getTokendata)

module.exports = router