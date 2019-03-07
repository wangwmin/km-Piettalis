/**
 * Created by bd on 2018/12/19.
 */
/* 所有前端的接口都放在这个文件中 */
var express = require('express');
var router = express.Router();

/* 连接数据库 */
var mysql = require("mysql");
var connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password:"admin",
    database:"piettalis"
});
connection.connect();

/* CORS跨域 */
router.all('*',function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","X-Requested-With");
    res.header("Access-Control-Allow-Methods","POST,GET");
    res.header("Content-Type","application/json;charset=utf-8");
    next();
});

/* 提供前端跨域的接口 */
/* 提供网站的基本信息 */
router.get("/web_information",function(req,res,next){
    connection.query("select * from web where id=1",function(error,results){
        res.send(results);
    })
});
 
/* 导航selec数据接口 */
var navcm=require("navcm");
var nav=navcm.navCM();
// 获取分类信息
router.get("/get_navSelect",function(req,res,next){
    // 获取所有导航数据
    connection.query("select * from nav",function(error,results){
        //调用navcm模块把得到的数据进行处理后 返回前端
        // 获取select数据，如果前端用户传回了想查找的id，那么就获取指定id，
        // 如果没有指定id，那么返回所有数据
        var nav_d = nav.get_hierarchy_select(results,req.query.id||0);
        res.send(nav_d);
    });
});

/* 导航json数据接口 */
router.get("/get_navJson",function(req,res,next){
    connection.query("select * from nav",function(error,results){
        /* 把获取到的数据放到 navcm模块中进行处理，以json层级形式返回给data变量 */
        //如果前端用户传回了想查找的id，那么就获取指定id，
        // 如果没有指定id，那么返回所有数据
// 		var data_s = nav.get_hierarchy_json(results,0);
// 		res.send(data_s);
        res.send(results);
    });
});

/* 获取某一个导航的数据 */
router.get("/get_nav_only",function(req,res,next){
    connection.query("select * from nav where id=?",[req.query.id],function(error,results){
        /* 把获取到的数据放到 navcm模块中进行处理，以json层级形式返回给data变量 */
        // var data_j=nav.get_hierarchy_json(results);
        // res.send(data_j);
		res.send(results);
    });
});

/* 获取所有的顶级导航 */
// 对所有的顶层导航进行排序
// 所有顶层导航的pid为 0
router.get("/get_nav_top",function(req,res,next){
    connection.query("select * from nav where pid=0",function(error,results){
        /* 把获取到的数据放到 navcm模块中进行处理，以json层级形式返回给data变量 */
//         var data_j=nav.get_hierarchy_json(results);
//         res.send(data_j);
		res.send(results);
    });
});
/* 获取某一顶级导航下的所有子导航 */
router.get("/get_topNav_all",function(req,res,next){
    connection.query("select * from nav where pid=?",[req.query.pid],function(error,results){
        res.send(results);
    });
});


// 获取banner
// 参数：pageCode
var pagination = require("tiny-pagination");
router.get("/get_banner",function(req,res,next){
	connection.query("select * from banner",function(e,r){
		res.send(r);
	})   
});

/* 查询所有文章 */
router.get("/get_article",function(req,res,next){
   connection.query("select * from article order by id "+req.query.id,function(error,results){
       res.send(results);
   })
});
/* 查询指定导航下所有热门文章 */
router.get("/get_hot_article",function(req,res,next){
   connection.query("select * from article where type=2 && pid in("+req.query.pid+") ",function(error,results){
       res.send(results);
   })
});


/* 查询指定导航下的所有文章 */
router.get("/get_Nav_allArticle",function(req,res,next){
    connection.query("select * from article where pid in("+req.query.pid+")",function(error,results){
        res.send(results);
    })
});

/* 查询某一篇文章 */
router.get("/get_article_only",function(req,res,next){
    connection.query("select * from article where id=?",[req.query.id],function(error,results){
        res.send(results);
    })
});

/* 查询文章类型 */
router.get("/get_article_type",function(req,res,next){
    connection.query("select * from article where type=?",[req.query.type],function(error,results){
        res.send(results);
    })
});

/* 查询指定功能 */
router.get("/get_article_conditions",function(req,res,next){
    // 1.指定获取的条数
    // 可以用limit来限制返回的数据数
    var sql="";
    if(req.query.limit){
        sql="select * from article "+" order by id " + req.query.order+" limit 0,"+req.query.limit;
        // 2.获取文章类型
        if(req.query.type){
            sql="select * from article where type="+req.query.type+" limit 0,"+req.query.limit;
            // 3.指定某一个导航下的文章
            if(req.query.pid){
                console.log(req.query.pid);
                sql="select * from article where type="+req.query.type+" && pid="+req.query.pid+" limit 0,"+req.query.limit;
            }
        }else{
            // 3.指定某一个导航下的文章
            if(req.query.pid){
                console.log(req.query.pid);
                sql="select * from article where pid="+req.query.pid+" limit 0,"+req.query.limit;
            }
            else{
                sql="select * from article "+" limit 0,"+req.query.limit;
            }
        }
    }else{
        sql="select * from article";
        // 2.获取文章类型
        if(req.query.type){
            sql="select * from article where type="+req.query.type;
            if(req.query.pid){
                console.log(req.query.pid);
                sql="select * from article where type="+req.query.type+" && pid="+req.query.pid;
            }
        }else {
            // 3.指定某一个导航下的文章
            if (req.query.pid) {
                console.log(req.query.pid);
                sql = "select * from article where pid=" + req.query.pid;
            }
        }
    }
    connection.query(sql,function(error,results){
        res.send(results);
    })
});

/* 获取文章分页显示 */
var pagination = require("tiny-pagination");
router.get("/get_article_page",function(req,res,next){
    // 分页路由
    // 必须参数：pageShow 表示每一页显示的条数；
    // 必须参数：pageCode 表示当前显示的页码
    var sql_pid="";
    if(req.query.pid){ sql_pid=" where pid in("+req.query.pid+") " }
    var sql_order="";
    if(req.query.order){ sql_order=" order by id "+req.query.order+" " }
    connection.query("select * from article"+sql_pid+sql_order,function(e,r){
        var count= r.length;
        var pageShow=parseInt(req.query.pageShow);
        //比如 一页显示5条数据，  总数据有29条   总页数=总数据条数/一页显示的条数
        var pageCount=Math.ceil(count/pageShow); //向上进一位，放置没有整除部分的数据
        //表示当前页码，当进行删除功能时如果删除后这一页没有数据了，就跳转到前一页去
        var acPage=req.query.pageCode>pageCount?pageCount:req.query.pageCode;
        // 假设当前页码为 acPage，总页码数为pageCount，中间按钮内的数字
        const pageInfo = pagination(parseInt(acPage),pageCount,7);
        //分页公式 ： limit "+(当前页码-1)*一页显示的条数+",一页显示的条数"
        connection.query("select * from article"+sql_pid+sql_order+" limit "+(acPage-1)*pageShow+","+pageShow,function(e,r){
            res.send({data1:r,data2:pageInfo});
        })
    });
    /*connection.query("select * from article",function(error,results){
     /!* 把获取到的数据放到 navcm模块中进行处理，以json层级形式返回给data变量 *!/
     res.send(results);
     });*/
});


/* 获取指定的 多条数据 */
router.get("/get_article_id",function(req,res,next){
    connection.query("select * from article where id in("+req.query.ids+")",[req.query.ids],function(error,results){
        res.send(results);
    })
});

/* 查询上一篇和下一篇 */
router.get("/get_article_prev",function(req,res,next){
    connection.query("select * from article where pid="+req.query.pid+" and id<"+req.query.id+" order by id desc limit 0,1",function(error,results){
        res.send(results);
    })
});
router.get("/get_article_next",function(req,res,next){
    connection.query("select * from article where pid="+req.query.pid+" and id>"+req.query.id+" order by id asc limit 0,1",function(error,results){
        res.send(results);
    })
});

/* 关联搜索 */
// 搜索文章标题，如果包含关键字就返回数据
router.get("/get_article_like",function(req,res,next){
    // select * from article where title like '%1%'，搜索所有标题内含有 1 的数据
    connection.query("select * from article where title like '%"+req.query.likeKey+"%'",function(error,results){
        res.send(results);
    })
});

module.exports = router;