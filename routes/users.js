var express = require('express');
var router = express.Router();
/* 访问users路由下的接口时，地址要加上users
    * http://127.0.0.1:4000/users/接口名
 */

var mysql = require("mysql");
var connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password:"admin",
    database:"piettalis"
});
connection.connect();

router.get("/userList",function(req,res,next){
    connection.query('select * from user',function(error,results,fields){
        res.send(req.query.callback+"("+JSON.stringify(results)+")");
    });
});

/* 验证码 */
var svgCaptcha = require('svg-captcha');
router.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create({
        size:4, // 验证码字符的个数，默认为四位验证码
        noise:2,// 干扰线的个数
        color:true,// 是否允许字体有颜色，要配合background来使用
        background:"#b5b5b5",// 验证码整体的背景颜色，设置背景颜色后干扰线颜色会随机变化
        width:120,// 验证码的宽度
        height:55,// 验证码的高度
        fontSize:55// 字体大小
    });
    res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
    /*req.session.captcha = captcha.text;*/
    res.cookie("code_text",captcha.text,{maxAge:1000*60*5});
    res.status(200).send(captcha.data);
});
module.exports = router;
