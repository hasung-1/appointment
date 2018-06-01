/**
 * 패스포트 설정 파일
 * 
 * 로컬 인증방식을 사용하는 패스포트 설정
 *
 * @date 2018-05-02
 * @author Sky
 */

var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var db = require('../db')


module.exports = new LocalStrategy({
	usernameField : 'email',
	passwordField : 'password',
	passReqToCallback : true,   // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	session :true,
}, function(req, email, password, done) { 
	console.log('passport의 local-login 호출됨 : ' + email + ', ' + password);
	
	db.query('select * from user where uuid=?',[email],function(err,user){
		//계정 있는지 체크
		if(user.length<=0)
		{
			return done(null,false,req.flash('loginMessage', '등록된 계정이 없습니다.'));
		}
		//패스워드 체크
		//console.log(user);
		if(user[0].upwd!=password)
		{
			return done(null,false,req.flash('loginMessage','비밀번호가 틀렸습니다.'));
		}

		console.log('계정과 비밀번호가 일치함.');
		return done(null,user[0]);
	});
});