var express = require('express');
var flash = require('connect-flash');

var app = express();

app.configure(function(){
    app.use(express.cookieParser('keyboard cat'));
    app.use(express.session({ cookie: { maxAge: 60000 }}));
    app.use(flash());
});

app.get('/flash',function(req,res){
    req.flash('info','Flash is back!');
    res.redirect('/');
});

app.get('/',function(req,res){
    res.render('index',)
});