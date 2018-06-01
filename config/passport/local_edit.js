/**
 * 패스포트 설정 파일
 * 
 * 로컬 인증방식에서 회원수정에 사용되는 패스포트 설정
 *
 * @date 2018-05-02
 * @author Sky
 */

var LocalStrategy = require('passport-local').Strategy;
var db = require('../db');
var async = require('async');


module.exports = new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, email, password, done) {
       
        //병원
        if(req.body.gubun=="hospital"){

            var user_up = 'UPDATE user SET uname=?, upwd=?, uphone=?, usido=?, ugungu=?, udong=?, uzip=?, uaddress=? WHERE uuid=?';
            var hos_up =  'UPDATE hospital SET name=?, dong=?, addr=?, tel=?, email=?, homepage=?, notice=? WHERE email=?';

            var user_data=[
                req.body.name,
                req.body.password,
                req.body.tel,
                req.body.sido,
                req.body.gungu,
                req.body.dong,
                req.body.post1,
                req.body.addr + ' ' + req.body.addr_,
                req.body.email];
            var hos_data=
                [req.body.name,
                req.body.dong,
                req.body.addr + ' ' + req.body.addr_,
                req.body.tel,
                req.body.email,
                req.body.homepage,
                req.body.notice,
                req.body.email];

            //update
            async.parallel({
                user_update : (callback) => db.query(user_up,user_data,callback),
                hos_update : (callback) => db.query(hos_up,hos_data,callback)
            },(err,results)=>{
                if(err){
                    console.log(err);
                    throw err;
                }
                else{
                    console.log("user & hospital 정보 Update.");
                    var hos_id = 'SELECT id FROM hospital WHERE uid=' + parseInt(req.user.uid) ;
                    var hos_sub_del = 'DELETE FROM hospital_subject WHERE hospital_id = (' + hos_id + ')'; 
                    var doctors_del = 'DELETE FROM doctors WHERE hospital_id  = (' + hos_id + ')'; 
                    var times_del = 'DELETE FROM times WHERE hospital_id  = (' + hos_id + ')'; 
                    var hosp_inst_id = '';

                    //delete
                    async.parallel({
                        hos_int_id : (callback) => db.query(hos_id,callback),
                        hos_sub_delete : (callback) => db.query(hos_sub_del,callback),
                        dr_delete : (callback) => db.query(doctors_del,callback),
                        time_delete : (callback) => db.query(times_del,callback)
                    },(err,results)=>{
                        if(err)
                            console.log(err);
                        else{
                            console.log('Hospital 관련 subject,doctor,time 삭제.');
                            var hosp_inst_id = results['hos_int_id'][0][0].id;
          
                            var hos_sub_len = req.body.subjects.length;
                            var dr_len = req.body.doctors.length;
                            var time_len = req.body.times.length;

                            console.log(hos_sub_len,dr_len, time_len);

                            //insert
                            async.parallel([
                                hos_sub_add,
                                dr_add,
                                time_add
                            ],function (err, results){
                                if (err)
                                    console.log(err)
                                else{
                                    console.log('Hospital 관련 subject,doctor,time 새로 추가.');
                                }
                            });
                        
                            function hos_sub_add(callback){
                                if (hos_sub_len==1){
                                    var hos_subject = [
                                        parseInt(hosp_inst_id),
                                        req.body.subjects];

                                    console.log(hos_subject);
                                    db.query('INSERT INTO hospital_subject (hospital_id, subject_id) VALUES (?, ?)',hos_subject,function(err,sub_result){
                                        if(err){
                                            console.log(err);
                                            throw err;
                                        }
                                        else{

                                            return (callback);
                                        }
                                    });
                                }else{
                                    for ( var i=0; i<hos_sub_len;i++){
                                        
                                        var hos_subject = [
                                            parseInt(hosp_inst_id),
                                            req.body.subjects[i]];

                                        console.log(hos_subject);
                                        db.query('INSERT INTO hospital_subject (hospital_id, subject_id) VALUES (?, ?)',hos_subject,function(err,sub_result){
                                            if(err){
                                                console.log(err);
                                                throw err;
                                            }
                                            else{

                                                return (callback);
                                            }
                                        });
                                    }
                                }
                            }
                            function dr_add(callback){
                                if (dr_len==1){
                                    var doctor_name = [
                                        parseInt(hosp_inst_id),
                                        req.body.doctors];

                                    console.log(doctor_name);
                                    db.query('INSERT INTO doctors (hospital_id, name) VALUES (?, ?)',doctor_name,function(err,dr_result){
                                        if(err){
                                            console.log(err);
                                            throw err;
                                        }
                                        else{

                                            return (callback);
                                        }
                                    });
                                }else{
                                    for ( var i=0; i<dr_len;i++){

                                        var doctor_name = [
                                            parseInt(hosp_inst_id),
                                            req.body.doctors[i]];

                                        console.log(doctor_name);
                                        db.query('INSERT INTO doctors (hospital_id, name) VALUES (?, ?)',doctor_name,function(err,dr_result){
                                            if(err){
                                                console.log(err);
                                                throw err;
                                            }
                                            else{

                                                return (callback);
                                            }
                                        });
                                    }
                                }
                            }
                            function time_add(callback){
                                if(time_len==1){
                                    var hos_time = [
                                        parseInt(hosp_inst_id),
                                        req.body.times];

                                    console.log(hos_time);

                                    db.query('INSERT INTO times (hospital_id, time) VALUES (?, ?)',hos_time,function(err,time_result){
                                        if(err){
                                            console.log(err);
                                            throw err;
                                        }
                                        else{

                                            return (callback);
                                        }
                                    });
                                }else{
                                    for ( var i=0; i<time_len;i++){

                                        var hos_time = [
                                            parseInt(hosp_inst_id),
                                            req.body.times[i]];

                                        console.log(hos_time);

                                        db.query('INSERT INTO times (hospital_id, time) VALUES (?, ?)',hos_time,function(err,time_result){
                                            if(err){
                                                console.log(err);
                                                throw err;
                                            }
                                            else{

                                                return (callback);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    });
                    return done(null,req.user[0],"ADDED");
                    
                }

            });
        }
        //개인
        else{
            var user_up = 'UPDATE user SET uname=?, upwd=?, uphone=?, usido=?, ugungu=?, udong=?, uzip=?, uaddress=? WHERE uuid=?';

            var user_data=[
                req.body.name,
                req.body.password,
                req.body.phoneNumber,
                req.body.sido,
                req.body.gungu,
                req.body.dong,
                req.body.post1,
                req.body.addr + ' ' + req.body.addr_,
                req.body.email];
            db.query(user_up,user_data,function(err,result){
                if(err){
                    console.log(err);
                    throw err;
                }else{
                    console.log("user 정보 Update.");
                    
                    db.query('select uid from user where uuid=?',req.user.uuid,function(err,id_result){
                      
                    var fam_del = 'DELETE FROM family WHERE user_id = (' + id_result[0].uid + ')'; 
                    
                        db.query(fam_del,function(err,result){
                            if (err){
                                console.log(err);
                                throw err;
                            }else{
                                console.log('가족 DB 정보 삭제');
                                console.log(req.user);
                                //console.log(req.user.uid);
                                
                                var fam_len = req.body.family.length;
                                if (fam_len==1){
                                    var fam_name = [
                                        id_result[0].uid,
                                        req.body.family];

                                    console.log(fam_name);
                                    db.query('INSERT INTO family (user_id, name) VALUES (?, ?)',fam_name,function(err,fam_result){
                                        if(err){
                                            console.log(err);
                                            throw err;
                                        }
                                        else{
                                            console.log('개인 관련 가족 데이터 추가함.');
                                        }
                                    });
                                }else{
                                    for ( var i=0; i<fam_len;i++){

                                        var fam_name = [
                                            id_result[0].uid,
                                            req.body.family[i]];

                                        console.log(fam_name);
                                        db.query('INSERT INTO family (user_id, name) VALUES (?, ?)',fam_name,function(err,fam_result){
                                            if(err){
                                                console.log(err);
                                                throw err;
                                            }
                                            else{
                                                console.log('개인 관련 가족 데이터 추가함.');
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    });
                   return done(null,req.user[0],"ADDED");
                }
            });
		} 
});
        
        
