//모듈
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');
var dateformat = require('dateformat');

//===== Passport 사용 =====//
var passport = require('passport');
var flash = require('connect-flash');
const mysql = require('mysql');

//===== 암호화 사용========//

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var app = express();
app.use(flash());

// view engine setup
//설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//MySQL 사용 설정
const options = {
  host:'61.42.20.5',
  port:3306,
  user:'reserve',
  password:'reserve',
  database:'hospital'
};

var temp1 = 1;
//===== Passport 사용 설정 =====//
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
var sessionStore = new MySQLStore(options);
app.use(session({
  secret:'hasung',
  resave:false,
  saveUninitialized:true,
  store:sessionStore
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var configPassport = require('./config/passport');
configPassport(app,passport);

//모든 템플릿에 필요한 변수 추가
app.use(function(req,res,next)
{
  res.locals.req = req;
  console.log("123123132");
  if(req.user)
  {
    res.locals.user = req.user;
    console.log("if in app");
    if(req.user.ishospital) {
      db.query('SELECT * FROM HOSPITAL WHERE ID = (SELECT ID FROM HOSPITAL WHERE UID=?)',[req.user.uid],function(err,results){
        console.log("if in app1");
        if(results) {
            res.locals.hospital = results[0]
        } else {
            res.locals.hospital = null;
        }
        res.locals.success = req.flash('success').toString();
        res.locals.error = req.flash('error').toString();
        console.log('if in app2');
        next();
      });
    } else {
      //병원 계정이라면 병원정보도 넘김
      res.locals.success = req.flash('success').toString();
      res.locals.error = req.flash('error').toString();
      next();
    } 
  } else {
    console.log("else in app");
    res.locals.user = null;

    next();
  }
  
  console.log('if in app3');
});


//라우터
var indexRouter = require('./routes/index');
app.use('/', indexRouter);



var usersRouter = require('./routes/users')(passport);
app.use('/users', usersRouter);

var hospitalRouter = require('./routes/hospital');
app.use('/hospital', hospitalRouter);



//테스트
app.get('/session',function(req,res){
  //console.log(req.session.user);
  res.send(req.session.user);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
