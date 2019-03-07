var express = require('express');
var router = express.Router();
/* ����users·���µĽӿ�ʱ����ַҪ����users
    * http://127.0.0.1:4000/users/�ӿ���
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

/* ��֤�� */
var svgCaptcha = require('svg-captcha');
router.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create({
        size:4, // ��֤���ַ��ĸ�����Ĭ��Ϊ��λ��֤��
        noise:2,// �����ߵĸ���
        color:true,// �Ƿ�������������ɫ��Ҫ���background��ʹ��
        background:"#b5b5b5",// ��֤������ı�����ɫ�����ñ�����ɫ���������ɫ������仯
        width:120,// ��֤��Ŀ��
        height:55,// ��֤��ĸ߶�
        fontSize:55// �����С
    });
    res.type('svg'); // ʹ��ejs��ģ��ʱ������� res.type('html')
    /*req.session.captcha = captcha.text;*/
    res.cookie("code_text",captcha.text,{maxAge:1000*60*5});
    res.status(200).send(captcha.data);
});
module.exports = router;
