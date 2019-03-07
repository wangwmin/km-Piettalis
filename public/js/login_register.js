/**
 * Created by bd on 2018/12/6.
 */

$(".checkBox").click(function(){
    $(this).toggleClass("active");
    if( $(this).hasClass("active")){
        $(this).css({border:"none"});
        $(this).html("<i class='layui-icon'>&#xe605;</i>");
    }else{
        $(this).css({border:""});
        $(this).html("");
    }
});

$(".reg_name").blur(function () {
    if ($(this).val()===""){
        $(this).css({borderColor:"rgba(255,0,0,.6)"});
        $(this).attr("placeholder","请输入用户名");
        $(this).addClass("placeholder");
    }else{
        $(this).css({borderColor:"",});
        $(this).attr("placeholder","用户名");
        $(this).removeClass("placeholder");
    }
});
$(".reg_email").blur(function () {
    if ($(this).val()===""){
        $(this).css({borderColor:"rgba(255,0,0,.6)"});
        $(this).attr("placeholder","请输入邮箱");
        $(this).addClass("placeholder");
    }else{
        if($(this).val().search(/^\w+@\w+\.\w+$/)!== -1 ){
            $(this).css({borderColor:"",});
            $(this).attr("placeholder","邮箱");
            $(this).removeClass("placeholder");
        }else{
           alert("请输入正确的邮箱地址！");
            $(this).css({borderColor:"rgba(255,0,0,.6)"});
        }
    }
});
$(".reg_pwd").blur(function () {
    if ($(this).val()===""){
        $(this).css({borderColor:"rgba(255,0,0,.6)"});
        $(this).attr("placeholder","请输入密码");
        $(this).addClass("placeholder");
    }else{
        $(this).css({borderColor:"",});
        $(this).attr("placeholder","密码");
        $(this).removeClass("placeholder");
    }
});


$(".log_name").blur(function () {
    if ($(this).val()===""){
        $(this).css({borderColor:"rgba(255,0,0,.6)"});
        $(this).attr("placeholder","请输入用户名");
        $(this).addClass("placeholder");
    }else{
        $(this).css({borderColor:"",});
        $(this).attr("placeholder","用户名");
        $(this).removeClass("placeholder");
    }
});

$(".log_pwd").blur(function () {
    if ($(this).val()===""){
        $(this).css({borderColor:"rgba(255,0,0,.6)"});
        $(this).attr("placeholder","请输入用户名");
        $(this).addClass("placeholder");
    }else{
        $(this).css({borderColor:"",});
        $(this).attr("placeholder","用户名");
        $(this).removeClass("placeholder");
    }
});