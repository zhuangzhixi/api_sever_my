var express = require('express');
const axios = require('axios');
// JSON Web Token
const jwt = require("jsonwebtoken");
// 微信小程序
let { appid, appSecret } = require('../config/wx');
// 数据库
const db = require('../db/index')

exports.getTokendata = async (req, res, next) => {
    // console.log(req);
    let { code } = req.body;
    // console.log("wx.login得到的code");
    // console.log(code);

    // 请求微信API，获取OpenID 
    let url = 'https://api.weixin.qq.com/sns/jscode2session';
    /**
     * openid:用户唯一标识
     * session_key:会话密钥
     * errcode:错误码
     * errmsg:错误信息
     */
    let { status, statusText, data: { openid, unionid, session_key, errcode, errmsg } } = await axios.get(url, {
        params: { appid, secret: appSecret, js_code: code, grant_type: "authorization_code" }
    })
    // console.log("返回状态");
    // console.log(status);
    // console.log(statusText);
    // console.log("返回数据");
    // console.log(openid);
    // console.log(session_key);
    // console.log(unionid);
    // console.log(errcode);
    // console.log(errmsg);

    if (status !== 200) {
        res.json({
            status: 200,
            msg: statusText
        });
        return;
    }

    // 微信api返回错误
    if (errcode) {
        res.json({
            status: false,
            msg: "微信API错误"
        });
        return;
    }
    // 生成token
    let token = jwt.sign({ openid, session_key }, 'secret');
    // 查询数据库中是否有此openid
    let select_sql = 'SELECT * FROM user WHERE openid = ?';
    let [results] = await db.query(select_sql, [openid]);
    // 如果没有此openid，插入新的数据
    if (results.length === 0) {
        let insert_sql = 'INSERT INTO user (openid,session_key) VALUES (?,?)';
        let [{ affectedRows: insert_affectedRows }] = await db.query(insert_sql, [openid, session_key]);
        if (insert_affectedRows > 0) {
            res.json({
                status: true,
                token: token
            });
        }
        return;
    }
    // 如果有此openid，更新session_key的数据
    let update_sql = 'UPDATE user SET session_key = ? WHERE openid = ?';
    let [{ affectedRows: update_affectedRows }] = await db.query(update_sql, [session_key, openid]);
    if (update_affectedRows > 0) {
        res.json({
            status: true,
            token: token
        });
    }
}