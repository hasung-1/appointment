/**
 * 패스포트 라우팅 함수 정의
 *
 * @date 2018-05-02
 * @author Sky
 */
const url = require('url');
const checkNotLogin = require('../middlewares/check').checkNotLogin

module.exports = function(passport) {
    console.log('users 호출됨.');
    var express = require('express');
    var async = require('async');
    var db = require('../config/db');
    var router = express.Router();
    
    // 홈 화면
    router.route('/').get(function(req, res) {
        console.log('/ 패스 요청됨.');

        // 인증 안된 경우
        if (!req.user) {
            console.log('사용자 인증 안된 상태임.');
            res.render('presignup', {login_success:req.user,title:'123'});
        } else {
            console.log('사용자 인증된 상태임.');
            res.render('index', {login_success:true,title:'123'});
            /*
            res.redirect(url.format({
                pathname:'/',
                query:{login_success:true}
            }));
            */
        }
    });
    
    // 로그인 화면
    router.route('/login').get(function(req, res) {
        console.log('/login 패스 요청됨.');
        res.render('login_test.ejs', {
            message: req.flash('loginMessage')});
    });

    // 회원가입 화면
    router.route('/signup').get(function(req, res) {
        console.log('/signup 패스 요청됨.');
        //res.render('signup.ejs', {login_success:'1',message: req.flash('signupMessage')});
        res.render('presignup');
    });
    
    //개인회원가입
    router.route('/signup/personal').get(function(req,res){
        res.render('signup_personal.ejs', {
            message: req.flash('signupMessage')
        });
    });

    //병원회원가입
    router.route('/signup/hospital').get(function(req,res){
        db.query('select * from subject',function(err,result,fields){
            if(err){
                console.log(err);
            }
            else{
                res.render('signup_hos.ejs', {
                    subjects:result,
                    message: req.flash('signupMessage')
                });
            }
        });
    });
        
    //정보수정 화면
    router.route('/edit').get(function(req,res){
        console.log('/edit get 패스 요청됨.');
        console.log(req.body);
        console.log(req.user.ishospital + ' ' + req.user.uname);
        //인증된 경우 req.user 객체의 사용자 정보를 받아 개인 과 병원 계정 구별해서 페이지 구분

        //인증안된 경우
        if(!req.user){
            console.log('사용자 인증 안된 상태');
            res.redirect('/');
        }
        else{
            console.log('사용자 인증된 상태.');
            //병원
            if(req.body.ishospital || req.user.ishospital){
                console.log('병원 계정 사용자.');
                db.query('select * from hospital where email=?',[req.user.uuid],function(err,hos_result,fields){
                    if(err){
                        console.log(err);
                    }
                    else{
                        user_Query = 'select * from user where uuid=?'
                        hos_sub_Query = 'select subject_id from hospital_subject where hospital_id=?';
                        doctor_Query = 'select name from doctors where hospital_id=?';
                        time_Query = 'select time from times where hospital_id=?';
                        subject_Query = 'select * from subject';

                        async.parallel(
                            {
                                user_data : (callback) => db.query(user_Query,req.user.uuid,callback),
                                hos_sub_data: (callback) => db.query(hos_sub_Query,parseInt(hos_result[0].id),callback),                                 
                                doctors_data: (callback) => db.query(doctor_Query,parseInt(hos_result[0].id),callback),                                
                                times_data: (callback) => db.query(time_Query,parseInt(hos_result[0].id),callback),
                                sub_data: (callback) => db.query(subject_Query,callback)        
                            },(err, results) => {                                
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    res.render('edit_hos.ejs', {                     
                                        subjects : results['sub_data'][0],
                                        hospital_info : hos_result[0],
                                        hos_sub_info : results['hos_sub_data'][0],
                                        doctor_info : results['doctors_data'][0],
                                        time_info : results['times_data'][0],
                                        message : req.flash('signupMessage')
                                    });
                                }
                        });                
                    }
                });
            }
            //개인
            else{
                console.log('개인 계정 사용자.');
                db.query('SELECT uid FROM user WHERE uuid=?',[req.user.uuid],function(err,id_result){
                    if(err) console.log(err);
                    else{
                        console.log(req.user);
                        db.query('select name from family where user_id=?',id_result[0].uid,function(err,person_result,fields){
                            if (err) console.log(err);
                            else{

                                res.render('edit_person.ejs', {
                                    fam_info : person_result,
                                    message: req.flash('signupMessage')
                                });
                                
                            }
                        });
                    }
                });
            }
        }
    });
	
    // 프로필 화면
    router.route('/profile').get(function(req, res) {
        console.log('/profile 패스 요청됨.');

        // 인증 안된 경우 
        if (!req.user) {
            console.log('사용자 인증 안된 상태임.');
            res.redirect('/');
        }
        // 인증된 경우, req.user 객체에 사용자 정보 있으며, 인증안된 경우 req.user는 false값임
        else {
            console.log('사용자 인증된 상태임.');
            console.log('/profile 패스 요청됨.');

            if(req.user.ishospital){

                hospital_Query = 'select * from (select c.*, d.ishospital, d.usido, d.ugungu, d.udong,(select group_concat(a.subject_id) as subjects from (select a.hospital_id as hospital_id, a.subject_id, b.subject as subject \
                             from hospital_subject a,subject b where a.subject_id = b.code) a where a.hospital_id=c.id group by a.hospital_id) as subject_code, (select group_concat(a.subject) as subjects from ( select a.hospital_id as hospital_id,a.subject_id, b.subject as subject \
                            from hospital_subject a,subject b where a.subject_id = b.code) a where a.hospital_id=c.id group by a.hospital_id) as subjects, (select group_concat(a.time) as times from ( select a.id as hospital_id, b.time as time\
                            from hospital a, times b where a.id = b.hospital_id) a where a.hospital_id=c.id group by a.hospital_id) as time, (select avg(eval_score) from reserve cc where cc.hospital_id=c.id group by hospital_id) as score\
                            from hospital c,user d where c.uid=d.uid) e where id = (select id from hospital where hospital.uid = ' + req.user.uid + ')';
                doctor_Query = 'select name, description from doctors where hospital_id = (select id from hospital where hospital.uid = ' + req.user.uid + ')';

                async.parallel({
                    info_hos : (callback)=>db.query(hospital_Query, callback),
                    info_doc : (callback)=>db.query(doctor_Query, callback)
                },(err,results)=>{
                     if (Array.isArray(req.user)) {
                        res.render('profile.ejs',{
                            user : req.user,
                            data_hos : results['info_hos'][0][0],
                            data_doc : results['info_doc'][0]
                        });
                    } else {
                        res.render('profile.ejs',{
                            user : req.user,
                            data_hos : results['info_hos'][0][0],
                            data_doc : results['info_doc'][0]
                        });
                    }
                });
               
            }else{
                if (Array.isArray(req.user)) {
                    res.render('profile.ejs',{user : req.user});
                } else {
                    res.render('profile.ejs',{user : req.user});
                }
            }    
        }
    });

    // 로그아웃
    router.route('/logout').get(function(req, res) {
        console.log('/logout 패스 요청됨.');
        req.logout();
        res.redirect('/');
    });


    // 로그인 인증
    /*
    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect : '/users/profile', 
        failureRedirect : '/users/login', 
        failureFlash : true 
    }));*/
    router.route('/login').post(function(req,res,next){
        passport.authenticate('local-login',function(err,user,info){
            if(err) return next(err);
            console.log("여기1")
            if(!user) return res.redirect('/login');
            console.log("여기2")
            req.login(user,function(err){
                if(err) return next(err);
                console.log("여기3")
                console.log(req.body.page);
                if(req.body.page){
                    return res.redirect(req.body.page);
                }
                else{
                    return res.redirect('/');
                }
            });
        })(req,res,next);
    });

    router.route('/edit').post(function(req,res,next){
        passport.authenticate('local-edit',function(err,user,info){
            if (err) return next(err);
            if (!user) return res.redirect('/');

            //정상적이면 
            if(info=='ADDED'){
                req.login(user,function(err){
                    if(err) return next(err);
                    console.log(res.header);
                    
                    return res.redirect('/users/profile');
                });
            } else{
                if(req.body.gubun=="hospital"){
                    return res.redirect('/users/signup/hospital');
                }
                else{
                    return res.redirect('/users/signup/personal');
                }
            }
        })(req,res,next);
    // router.route('edit').post(
    //     passport.authenticate('local-edit', 
    //     {
    //         successRedirect : '/users/profile', 
    //         failureRedirect : '/users/edit', 
    //         failureFlash : true 
    });

    // 회원가입 인증
    router.route('/signup').post(function(req,res,next){
        passport.authenticate('local-signup',function(err,user,info){
            
            if(err) return next(err);
            if(!user) return res.redirect('/');
            
            //정상적으로 추가되었다면...
            if(info=="ADDED")
            {
                req.login(user,function(err){
                    if(err) return next(err);
                    console.log(res.header);
                    
                    return res.redirect('/users/profile');
                });
            }
            //에러가 있다면...
            else
            {
                if(req.body.gubun=="hospital"){
                    return res.redirect('/users/signup/hospital');
                }
                else{
                    return res.redirect('/users/signup/personal');
                }
            }
        })(req,res,next);
    });
    
/*
    // 패스포트 - 페이스북 인증 라우팅 
    router.route('/auth/facebook').get(passport.authenticate('facebook', { 
        scope : 'email' 
    }));

    // 패스포트 - 페이스북 인증 콜백 라우팅
    router.route('/auth/facebook/callback').get(passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));
*/
 return router;
};