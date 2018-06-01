/**
 * 패스포트 설정 파일
 * 
 * 로컬 인증방식에서 회원가입에 사용되는 패스포트 설정
 *
 * @date 2018-05-02
 * @author Sky
 */

var LocalStrategy = require('passport-local').Strategy;
var db = require('../db');
var dateformat = require('dateformat');

module.exports = new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, email, password, done) {
            console.log('passport의 local-signup 호출 : ' + email + ', ' + password);
            // 요청 파라미터 중 name 파라미터 확인
            console.log(req.body);
                var paramName = req.body.name || req.query.name;
                console.log('passport의 local-signup 호출됨(병원) : ' + email + ', ' + password + ', ' + paramName);
            //병원
            if(req.body.gubun=="hospital"){
                db.query('select uid from user where uuid=?',email,function(err,users){
                    if(users.length>0){
                        console.log('기존에 계정이 있음.');
                        return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
                    }
                    else{
                        //user data
                        var data = {
                            uuid:email,
                            uname:paramName,
                            upwd:password,
                            uphone : req.body.tel,
                            ucreate : dateformat(Date(),"yyyy-mm-dd HH:MM"),
                            upoint : null,
                            isUse : 1,
                            usido : req.body.gungu.slice(0,2),
                            ugungu : req.body.gungu,
                            udong : req.body.dong,
                            uzip : req.body.post1,
                            uaddress : req.body.addr + ' ' + req.body.addr_,
                            ishospital:1,
                        };
                        db.query('insert into user set?',data,function(err,result){
                            if(err){
                                console.log(err);
                                throw err;
                            }
                            else{
                                //hospital data
                                console.log(result);
                                var hos_data ={
                                    name : paramName,
                                    dong : req.body.dong,
                                    addr : req.body.addr + ' ' + req.body.addr_,
                                    tel : req.body.tel,
                                    email : email,
                                    homepage : req.body.homepage,
                                    notice : req.body.notice,
                                    isUse:1,
                                    uid : result.insertId};
                                console.log(hos_data);
                                db.query('insert into hospital set?',hos_data,function(err,hos_result){
                                    if(err){
                                        console.log(err);
                                        throw err;
                                    }
                                    else{
                                        
                                        var len = Object.keys(req.body.subjects).length;
                                        for ( var i=0; i<len;i++){

                                            var hos_subject = {
                                                hospital_id : parseInt(hos_result.insertId),
                                                subject_id : req.body.subjects[i] };
                                            console.log(hos_subject);
                                            db.query('insert into hospital_subject set?',hos_subject,function(err,sub_result){
                                                if(err){
                                                    console.log(err);
                                                    throw err;
                                                }
                                                else{
                                                    console.log(hos_subject);
                                                    console.log('병원 관련 진료 데이터 추가함.',sub_result.insertId);
                                                }
                                            });
                                            
                                        }
                                        console.log(hos_result);
                                        console.log('병원 사용자 관련 데이터 추가함.',hos_result.insertId);
                                    }
                                });
                                console.log(result);
                                console.log('병원 사용자 데이터 추가함.',result.insertId);
                            }
                            
                           
                            data.uid = result.insertId;
                        console.log(data);
                        return done(null,data,'ADDED');

                        });
                    }
                });
            }
            //개인
            else{
                db.query('select uid from user where uuid=?',[email],function(err,users){
                    if(users.length>0){
                        console.log('기존에 계정이 있음.');
                        return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));
                        // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
                    }
                    console.log(req.body);
                    //personal data
                    var data = {
                        uuid:email,
                        uname:paramName,
                        upwd:password,
                        uphone : req.body.phoneNumber,
                        ucreate : dateformat(Date(),"yyyy-mm-dd HH:MM"),
                        upoint : null,
                        isUse : 1,
                        usido : req.body.gungu.slice(0,2),
                        ugungu : req.body.gungu,
                        udong : req.body.dong,
                        uzip : req.body.post1,
                        uaddress : req.body.addr + ' ' + req.body.addr_,
                        ishospital:0,
                        gender : req.body.gender,
                    };
                    db.query('insert into user set ?',data,function(err,result){
                        if(err)
                        {
                            console.log(err);
                            throw err;
                        }
                        
                        console.log('개인 사용자 데이터 추가함.',data.uuid);

                        
                        
                        data.uid = result.insertId;
                        console.log(data);
                        return done(null,data,'ADDED');
                    });
                });
            }
        }
);
        