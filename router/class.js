const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const user_handler = require('../router_handler/class')


// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
// const { reg_login_schema } = require('../schema/user')

// 注册新用户
// router.post('/reguser', expressJoi(reg_login_schema), user_handler.regUser)

// 登录
// router.post('/login', expressJoi(reg_login_schema), user_handler.login)
//获取课程首页轮播图数据
router.get('/home/swiperdata', user_handler.getSwiperData)
//获取课程首页楼层数据
router.get('/home/floordata', user_handler.getFloorData)
//点击课程进入课程详情页
router.get('/class_detail/class_detail/:id', user_handler.getClassDetail)
//修改课程信息,也就是收藏
router.post('/class_detail/update_class', user_handler.updateClass)
//获取收藏的课程信息
router.get('/order/myorder', user_handler.getMyOrder)
//根据发送来的关键字搜索课程
router.get('/search/search/:key', user_handler.getSearch)
//记录浏览该课程的时间戳
router.get('/class_detail/record_time/:id/:time', user_handler.recordTime)
//根据课程被浏览的时间戳排序得到历史足迹
router.get('/class_detail/get_history', user_handler.getHistory)
//获取题库
router.get('/question/get_question', user_handler.getQuestion)
//保存考试成绩
router.post('/question/save_score', user_handler.saveScore)
//获取考试成绩
router.get('/question/get_score', user_handler.getScore)
//获取选择的备考科目
router.get('/question/get_subject', user_handler.getSubject)
//选择备考科目
router.post('/question/set_subject', user_handler.chooseSubject)
//题目收藏
router.post('/question/collect_question', user_handler.collectQuestion)
//回答题目
router.post('/question/answer_question', user_handler.answerQuestion)
//获取考试时间
router.get('/question/get_time', user_handler.getTime)
//获取当前备考科目的历年试卷名字
router.get('/question/get_examname', user_handler.getExamname)
//获取当前备考科目的专项练习名字
router.get('/question/get_zxname', user_handler.getZxname)
//获取资讯模块的数据
router.get('/news/get_news', user_handler.getNews)
//最多访问
router.get('/news/get_visit', user_handler.getVisit)
//最多回复
router.get('/news/get_reply', user_handler.getReply)
//最多收藏
router.get('/news/get_collect', user_handler.getCollect)
//获取资讯模块的官方公告
router.get('/news/get_gonggao', user_handler.getGonggao)
//根据资讯id获取资讯详情
router.get('/news/get_news_detail/:id', user_handler.getNewsDetail)
//资讯详情功能中的收藏功能
router.post('/news/collect_news', user_handler.collectNews)
//保存发布的帖子
router.post('/news/save_news', user_handler.saveNews)
module.exports = router