var express = require('express');
var router = express.Router();

/* GET home page. */

var mysql = require("mysql");
var connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password:"admin",
    database:"piettalis"
});
connection.connect();

//获取本地域名，设置变量存放这个地址
//文件上传时把 这个地址 存放到数据库中，就可以在跨域时获取到这个服务器中的上传文件
var host = "http://139.196.86.179:309";

/* node 设置cookie */
router.get("/setCookie",function(req,res,next){
    //存放cookie
    res.cookie("name",req.query.name,{maxAge:1000*60*2});
    //读取cookie
    console.log(req.cookies);
    console.log(req.cookies.name);
    //删除cookie
    /* res.clearCookie("name");*/
    //响应
    res.send(req.cookies.name);
});

router.post("/register",function(req,res,next){
    connection.query("select UserName from user where UserName=?",[req.body.UserName],function(error,results){
        if(results.length>0){
            res.send("repeat");
        }else{
            connection.query("insert into user set UserName=?,Email=?,PassWord=?",[req.body.UserName,req.body.Email,req.body.PassWord],function(error,results){
                if(results.insertId){
                    res.send(results);
                }
            });
        }
    })
});


router.post("/login",function(req,res,next){
    connection.query("select UserName from user where UserName=? and PassWord=?",[req.body.UserName,req.body.PassWord],function(error,results){
        if(results.length>0){
            res.cookie("uName",req.body.UserName);
            res.send("true");
        }else{
            res.send("用户名或密码错误");
        }
    })
});
router.post("/keep_login",function(req,res,next){
    res.cookie("uName",req.body.UserName);
    res.cookie("uPwd",req.body.PassWord);
    res.send("true");
});
router.get("/out_login",function(req,res,next){
    res.clearCookie("uName");
    res.clearCookie("uPwd");
    res.redirect("/login.html");
});


/* * */
// 获取网站配置的信息
router.get("/get_web",function(req,res,next){
    connection.query("select * from web where id=?",[1],function(error,results){
        console.log(results);
        res.send(results);
    });
});

// 保存用户输入的网站信息，由于其中还有logo图片的上传，因此需要调用文件上传模块
//第一步：引用文件上传模块
var multer  = require('multer');
//第二步：配置文件上传模块
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir="public/img"; //设置目录名称
        multer({dest:dir});//如果目录不存在就创建目录
        cb(null, dir);//把上传的文件存在这个目录
    },
    filename: function (req, file, cb) {
        // logo图片文件保存时使用的文件名
        // 如果前端设置了文件名，那么就使用req.body.logo_reName调用它；
        // 如果没有设置，那么就使用Date.now()返回一个毫秒数来当做上传文件的名称
        cb(null,req.body.logo_reName+"."+file.originalname.split(".")[1]||Date.now()+"."+file.originalname.split(".")[1]);//设置上传的文件名称，表示使用上传时的名字
    }
});
var upload = multer({ storage: storage });//使用配置文件
//第三步：设置和更新网站配置
router.post("/update_web",upload.single('logo'),function(req,res,next){
    // 判断用户是否有进行网站logo图片的文件上传操作
    if(req.file){  // 如果上传了文件，就进行文件上传操作，把图片的地址存到数据库中
        var sql_update="update web set title=?,keyWord=?,company=?,description=?,logo=?,ICP=? where id=1";
        var req_data=[req.body.title,req.body.keyWord,req.body.company,req.body.description,host+"/img/"+req.file.filename,req.body.ICP];
        connection.query(sql_update,req_data,function(error,results){
            res.send("success");
        })
    }else{ // 如果没有，就不进行文件上传
        sql_update="update web set title=?,keyWord=?,company=?,description=?,ICP=? where id=1";
        req_data=[req.body.title,req.body.keyWord,req.body.company,req.body.description,req.body.ICP];
        connection.query(sql_update,req_data,function(error,results){
            res.send("success");
        })
    }
});

// banner添加
//第一步：引用文件上传模块
multer  = require('multer');
//第二步：配置文件上传模块
var storage_article = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir="public/banner"; //设置目录名称
        multer({dest:dir});//如果目录不存在就创建目录
        cb(null, dir);//把上传的文件存在这个目录
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+"."+file.originalname.split(".")[1]);
    }
});
var upload_banner = multer({ storage: storage_article });//使用配置文件
router.post("/add_banner",upload_banner.single('article_banner'),function(req,res,next){
		var sql_insert="insert into banner set " +"pid=?,banner_link=?";
        var req_data=[
				req.body.article_style,
                req.file?host+"/banner/"+req.file.filename:"",
        ];
        connection.query(sql_insert,req_data,function(error,results){
            res.send("success");
        });
});

// 获取banner
var pagination = require("tiny-pagination");
router.get("/get_banner",function(req,res,next){
    // 分页路由
    connection.query("select * from banner",function(e,r){
        var count= r.length;
        //比如 一页显示5条数据，  总数据有29条   总页数=总数据条数/一页显示的条数
        var pageCount=Math.ceil(count/5); //向上进一位，放置没有整除部分的数据

        //表示当前页码，当删除时如果删除后这一页没有数据了，就跳转到前一页去
        var acPage=req.query.pageCode>pageCount?pageCount:req.query.pageCode;
        // 假设当前页码为 acPage，总页码数为pageCount，中间按钮内的数字
        const pageInfo = pagination(parseInt(acPage),pageCount,7);
        //分页公式 ： limit "+(当前页码-1)*一页显示的条数+",一页显示的条数"
        connection.query("select * from banner limit "+(acPage-1)*5+",5",function(e,r){
            res.send({data1:r,data2:pageInfo});
        })
    });
    /*connection.query("select * from banner",function(error,results){
        /!* 把获取到的数据放到 navcm模块中进行处理，以json层级形式返回给data变量 *!/
        res.send(results);
    });*/
});



/* 添加导航路由 */
var navcm=require("navcm");
var nav=navcm.navCM();
// 获取分类信息
router.get("/get_nav",function(req,res,next){
    // 获取所有导航数据
    connection.query("select * from nav",function(error,results){
        //调用navcm模块把得到的数据进行处理后 返回前端
        var nav_d = nav.get_hierarchy_select(results);// 获取select数据
        res.send(nav_d);
    });
});
// 添加分类信息
//第一步：引用文件上传模块
/* multer  = require('multer'); */
//第二步：配置文件上传模块
var storage_article = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir="public/img"; //设置目录名称
        multer({dest:dir});//如果目录不存在就创建目录
        cb(null, dir);//把上传的文件存在这个目录
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+"."+file.originalname.split(".")[1]);
    }
});
var upload_banner = multer({ storage: storage_article });//使用配置文件
router.post("/set_nav",upload_banner.single('nav_banner'),function(req,res,next){
	connection.query("select id from nav where navName=?",req.body.nav_navName,function(error,results){
	    if(results.length>0){// 添加的导航名已经存在
	        res.send("已存在！");
	    }else{
	        var nav_sql="insert into nav set navName=?,linkSrc=?,keyWord=?,description=?,banner=?,pid=?";
	        var nav_data=[
	                        req.body.nav_navName,
	                        req.body.nav_linkSrc,
	                        req.body.nav_keyWord,
	                        req.body.nav_description,
							req.file?host+"/img/"+req.file.filename:"",
	                        req.body.nav_pid,
	                      ];
	        connection.query(nav_sql,nav_data,function(error,results){
	            res.send("success");
	        });
	    }
	});
});


/* 导航列表 */
router.get("/get_navList",function(req,res,next){
    connection.query("select * from nav",function(error,results){
        /* 把获取到的数据放到 navcm模块中进行处理，以json层级形式返回给data变量 */
        var data_s=nav.get_hierarchy_json(results);
        res.send(data_s);
    });
});
//删除导航列表
router.post("/del_navList",function(req,res,next){
    // 1. 先获取所有的导航数据，提取出符合条件的数据以及它的子数据
    connection.query("select * from nav",function(error,results){
        var data_id=nav.get_insertAll_id(results,req.body.id_num);
        connection.query("delete from nav where id in("+data_id+")",function(error,results){
            res.send("删除成功！");
        });
    });
});

/* 使用ueditor模块，支持多类型文件上传 */
var bodyParser = require('body-parser');
var ueditor = require("ueditor");
var path = require("path");
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());
// __dirname：获取当前目录的路径（E:\km_3\routes）
// replace("routes","")：把__dirname输出的路径中的“routes”字符串给删除掉，让程序去寻找km_3下的public
//   否则程序只会在 E:\km_3\routes 地址下寻找public，如果没找到还会在 routes 文件夹下创建一个public文件夹
router.use("/ueditor/ue", ueditor(path.join(__dirname.replace("routes",""),'public'), function(req, res, next) {

    var imgDir = host+'/img/'; //默认上传地址为图片
    var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;//默认上传地址为图片
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/'; //附件保存地址
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; //视频保存地址
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //客户端发起图片列表请求
    else if (ActionType === 'listimage'){

        res.ue_list(imgDir);  // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/ueditor.config.json');
    }}));


// 文章添加路由
//第一步：引用文件上传模块
multer  = require('multer');
//第二步：配置文件上传模块
var storage_article = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir="public/img"; //设置目录名称
        multer({dest:dir});//如果目录不存在就创建目录
        cb(null, dir);//把上传的文件存在这个目录
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+"."+file.originalname.split(".")[1]);
    }
});
var upload_article = multer({ storage: storage_article });//使用配置文件
router.post("/add_article",upload_article.single('article_banner'),function(req,res,next){
        var sql_insert="insert into article set " +
            "pid=?,type=?,title=?,keyWord=?,description=?,banner=?,contents=? ";
        var req_data=[
                req.body.article_style,
                req.body.article_type,
                req.body.article_title,
                req.body.article_key,
                req.body.article_describe,
                req.file?host+"/img/"+req.file.filename:"",
                req.body.article_content
        ];
        connection.query(sql_insert,req_data,function(error,results){
            res.send("success");
        });
});


// 获取文章列表
var pagination = require("tiny-pagination");
router.get("/get_articleList",function(req,res,next){
    // 分页路由
    connection.query("select * from article",function(e,r){
        var count= r.length;
        //比如 一页显示5条数据，  总数据有29条   总页数=总数据条数/一页显示的条数
        var pageCount=Math.ceil(count/5); //向上进一位，放置没有整除部分的数据

        //表示当前页码，当删除时如果删除后这一页没有数据了，就跳转到前一页去
        var acPage=req.query.pageCode>pageCount?pageCount:req.query.pageCode;
        // 假设当前页码为 acPage，总页码数为pageCount，中间按钮内的数字
        const pageInfo = pagination(parseInt(acPage),pageCount,7);
        //分页公式 ： limit "+(当前页码-1)*一页显示的条数+",一页显示的条数"
        connection.query("select * from article  limit "+(acPage-1)*5+",5",function(e,r){
            res.send({data1:r,data2:pageInfo});
        })
    });
    /*connection.query("select * from article",function(error,results){
        /!* 把获取到的数据放到 navcm模块中进行处理，以json层级形式返回给data变量 *!/
        res.send(results);
    });*/
});
//删除文章列表
router.post("/del_articleList",function(req,res,next){
    connection.query("delete from article where id in("+req.body.id_num+")",function(error,results){
            res.send("删除成功！");
    });
});
































module.exports = router;
