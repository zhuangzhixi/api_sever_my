/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
// 导入数据库操作模块
const db = require('../db/index')
// 导入 bcryptjs 模块
const bcrypt = require('bcryptjs')
//导入moment包
const moment = require('moment')


// 注册用户的处理函数
exports.regUser = (req, res) => {
    // 接收表单数据
    const userinfo = req.body// 判断数据是否合法
    // if (!userinfo.username || !userinfo.password) {
    //     // return res.send({ status: 1, message: '用户名或密码不能为空！' })
    //     return res.cc('用户名或密码不能为空！')
    // }
    const sql = `select * from ev_users where username=?`
    db.query(sql, [userinfo.username], (err, results) => {
        // 执行 SQL 语句失败
        if (err) {
            // return res.send({ status: 1, message: err.message })
            return res.cc(err)
        }
        // 用户名被占用
        if (results.length > 0) {
            // return res.send({status: 1, message: '用户名被占用，请更换其他用户名！'})
            return res.cc('用户名被占用，请更换其他用户名！')
        }
        // TODO: 用户名可用，继续后续流程...
        // 对密码进行 bcrypt 加密处理
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)//10是加密的强度,不是密码的长度
        // 定义插入新用户的 SQL 语句
        const sql = `insert into ev_users set ?`
        // 调用 db.query() 执行 SQL 语句，实现用户注册的功能
        db.query(sql, { username: userinfo.username, password: userinfo.password }, function (err, results) {
            // 执行 SQL 语句失败
            if (err) return res.send({ status: 1, message: err.message })
            // SQL 语句执行成功，但影响行数不为 1
            if (results.affectedRows !== 1) {
                // return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
                return res.cc('注册用户失败，请稍后再试！')
            }
            // 注册成功
            // res.send({ status: 0, message: '注册成功！' })
            res.cc('注册成功！', 0)
        })
    })
}

// 登录的处理函数
exports.login = (req, res) => {
    res.send('login OK')
}

exports.getSwiperData = async (req, res) => {
    // 定义插入新用户的 SQL 语句
    const sql = `select * from swiperdata`
    // 调用 db.query() 执行 SQL 语句，实现用户注册的功能
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    const status = res.statusCode;
    res.send({
        "message": results,
        "meta": {
            "msg": "获取成功",
            "status": status
        }
    })
}


exports.getFloorData = async (req, res) => {
    // 定义插入新用户的 SQL 语句
    const sql2 = `select * from classdata where category2=?`
    const sql1 = `select category2 from classdata where category in (select chose from user) group by category2;`
    let [results] = await db.query(sql1);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    let data = {};
    data.meta = {
        "msg": "获取成功",
        "status": 200
    };
    data.message = [];
    let results21 = [];
    for (let i = 0; i < results.length; i++) {
        let [results2] = await db.query(sql2, results[i].category2);
        if (results2.length == 0) {
            return res.cc('查找失败！')
        }
        let data1 = {};
        data1.floor_title = results[i].category2;
        data1.product_list = JSON.parse(JSON.stringify(results2));
        results21.push(JSON.parse(JSON.stringify(data1)));
        data.message.push(results21[i]);
        if (i == results.length - 1) {
            res.send(data);
        }
    }
}
//修改课程信息,也就是收藏
exports.updateClass = async (req, res) => {
    const data = req.body;
    const sql = `update classdata set id=?,category=?,classname=?,describtion=?,content=?,image=?,money=?,star=?,teacherid=?,url=? where id=?`;
    let [results] = await db.query(sql, [data.id, data.category, data.classname, data.describtion, data.content, data.image, data.money, data.star, data.teacherid, data.url, data.id]);
    if (results.affectedRows !== 1) {
        return res.cc('修改失败！')
    }
    res.send({
        "meta": {
            "msg": "获取成功",
            "status": 200,
        }
    })
}
//获取收藏的课程信息
exports.getMyOrder = async (req, res) => {
    const sql = `select classdata.*,teacherdata.teachername,teacherdata.image as teacherimage from classdata JOIN teacherdata ON classdata.teacherid = teacherdata.id where classdata.star=1`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "meta": {
            "msg": "获取成功",
            "status": 200
        }
    })
}
//通过搜索id获取课程详情
exports.getClassDetail = async (req, res) => {
    const data = req.params;
    const sql = `select classdata.*,teacherdata.teachername,teacherdata.image as teacherimage from classdata JOIN teacherdata ON classdata.teacherid = teacherdata.id where classdata.id=?`;
    let [results] = await db.query(sql, data.id);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "meta": {
            "msg": "获取成功",
            "status": 200
        }
    })
}
//通过发送来的关键字搜索课程
exports.getSearch = async (req, res) => {
    const data = req.params;
    const sql = `select classdata.*,teacherdata.teachername,teacherdata.image as teacherimage from classdata join teacherdata ON classdata.teacherid = teacherdata.id where classdata.classname like '%${data.key}%'`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "meta": {
            "msg": "获取成功",
            "status": 200
        }
    })
}
//记录浏览该课程的时间戳
exports.recordTime = async (req, res) => {
    const data = req.params;
    const sql = `update classdata set time=? where id=?`;
    let [results] = await db.query(sql, [data.time, data.id]);
    if (results.affectedRows !== 1) {
        return res.cc('修改失败！')
    }
    res.send({
        "meta": {
            "msg": "修改成功",
            "status": 200,
        }
    })
}
//根据课程被浏览的时间戳排序得到历史足迹
exports.getHistory = async (req, res) => {
    const sql = `select classdata.*,teacherdata.teachername,teacherdata.image as teacherimage from classdata join teacherdata ON classdata.teacherid = teacherdata.id WHERE classdata.time != 0  order by time desc`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    // 把时间戳转换成时间格式
    for (let i = 0; i < results.length; i++) {
        results[i].time = moment(results[i].time * 1000).format('YYYY-MM-DD HH:mm:ss');
    }
    res.send({
        "message": results,
        "meta": {
            "msg": "获取成功",
            "status": 200
        }
    })
}
//获取题库
exports.getQuestion = async (req, res) => {
    var sql = '';
    if (req.query.examname) {
        sql = `select * from questions where examname=?`;
        var [results] = await db.query(sql, req.query.examname);
    } else if (req.query.zxname) {
        sql = `select * from questions where zuangxiantype=?`;
        var [results] = await db.query(sql, req.query.zxname);
    } else if (req.query.collectfunction) {
        sql = `select * from questions where collect=?`;
        var [results] = await db.query(sql, req.query.collectfunction);
    } else if (req.query.worsequestion) {
        sql = `SELECT * FROM questions WHERE answer != done;`;
        var [results] = await db.query(sql);
    }
    else {
        sql = `select * from questions WHERE done IS NULL ORDER BY RAND() LIMIT 50;`;
        var [results] = await db.query(sql);
    }
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    // 在results对象中添加一个属性answerSheet,并把results里面的a、b、c、d属性以{value:'A'，name:'值'}的形式存储到answerSheet数据里面，并把原来的a、b、c、d属性删除
    for (let i = 0; i < results.length; i++) {
        results[i].answerSheet = [];
        results[i].answerSheet.push({
            value: 'A',
            name: results[i].a
        });
        results[i].answerSheet.push({
            value: 'B',
            name: results[i].b
        });
        results[i].answerSheet.push({
            value: 'C',
            name: results[i].c
        });
        results[i].answerSheet.push({
            value: 'D',
            name: results[i].d
        });
        delete results[i].a;
        delete results[i].b;
        delete results[i].c;
        delete results[i].d;
    }

    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}
//保存考试成绩
exports.saveScore = async (req, res) => {
    const data = req.body;
    const sql = `insert into score set ?;`;
    let [results] = await db.query(sql, data);
    if (results.affectedRows !== 1) {
        return res.cc('保存失败！')
    }
    res.send({
        "msg": "保存成功",
        "status": 200,
    })
}
//获取考试成绩
exports.getScore = async (req, res) => {
    const sql = `select * from score`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}
//获取选择的备考科目
exports.getSubject = async (req, res) => {
    const sql = `SELECT chose FROM user`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}
//保存选择的备考科目
exports.chooseSubject = async (req, res) => {
    const data = req.body;
    const sql = `update user set chose=?`;
    let [results] = await db.query(sql, data.chose);
    if (results.affectedRows !== 1) {
        return res.cc('保存失败！')
    }
    res.send({
        "msg": "保存成功",
        "status": 200,
    })
}

//题目收藏
exports.collectQuestion = async (req, res) => {
    const data = req.body;
    const sql = `update questions set collect=? where id=?;`;
    let [results] = await db.query(sql, [data.collect, data.id]);
    if (results.affectedRows !== 1) {
        return res.cc('收藏失败！')
    }
    res.send({
        "msg": "收藏成功",
        "status": 200,
    })
}

//回答题目
exports.answerQuestion = async (req, res) => {
    const data = req.body;
    const sql = `update questions set done=? where id=?;`;
    let [results] = await db.query(sql, [data.done, data.id]);
    if (results.affectedRows !== 1) {
        return res.cc('回答失败！')
    }
    res.send({
        "msg": "回答成功",
        "status": 200,
    })
}
//获取考试时间
exports.getTime = async (req, res) => {
    const sql = `select y,m,d from examtime where examname in (select chose from user);`;
    let [results] = await db.query(sql, req.query.examname);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}

//获取当前备考科目的历年试卷名字
exports.getExamname = async (req, res) => {
    const sql = `select examname from questions where category in (select chose from user) group by examname;`;
    let [results] = await db.query(sql, req.query.examname);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}

//获取当前备考科目的专项练习名字
exports.getZxname = async (req, res) => {
    const sql = `select zuangxiantype from questions where category in (select chose from user) group by zuangxiantype;`;
    let [results] = await db.query(sql, req.query.examname);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}
//最新发布
exports.getNews = async (req, res) => {
    const sql = `select * from message WHERE user <> 'admin'  and type in (select chose from user) order by time desc;`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}
//最多访问
exports.getVisit = async (req, res) => {
    const sql = `select * from message WHERE user <> 'admin'  and type in (select chose from user) order by fw desc;`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}
//最多回复
exports.getReply = async (req, res) => {
    const sql = `select * from message WHERE user <> 'admin'  and type in (select chose from user) order by huifu desc;`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}
//最多收藏
exports.getCollect = async (req, res) => {
    const sql = `select * from message WHERE user <> 'admin'  and type in (select chose from user) order by soucan desc;`;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}


//获取资讯模块的官方公告
exports.getGonggao = async (req, res) => {
    const sql = `select * from message WHERE user='admin' and type in (select chose from user) `;
    let [results] = await db.query(sql);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results,
        "msg": "获取成功",
        "status": 200
    })
}


//根据资讯id获取资讯详情
// router.get('/news/get_news_detail/:id', user_handler.getNewsDetail)
exports.getNewsDetail = async (req, res) => {
    const sql = `select * from message where id=?`;
    let [results] = await db.query(sql, req.params.id);
    if (results.length == 0) {
        return res.cc('查找失败！')
    }
    res.send({
        "message": results[0],
        "msg": "获取成功",
        "status": 200
    })
}

//资讯详情功能中的收藏功能
exports.collectNews = async (req, res) => {
    const data = req.body;
    const sql = `update message set issoucan=? where id=?;`;
    let [results] = await db.query(sql, [data.issoucan, data.id]);
    if (results.affectedRows !== 1) {
        return res.cc('收藏失败！')
    }
    res.send({
        "msg": "收藏成功",
        "status": 200,
    })
}

//保存发布的帖子
exports.saveNews = async (req, res) => {
    const data = req.body;
    const sql = `insert into message set ?`;
    let [results] = await db.query(sql, data);
    if (results.affectedRows !== 1) {
        return res.cc('保存失败！')
    }
    res.send({
        "msg": "保存成功",
        "status": 200,
    })
}
