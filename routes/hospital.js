
//import { isNullOrUndefined } from 'util';

var express = require('express');

var async = require('async');
var fs = require('fs');
var ejs = require('ejs');
var util = require('util');
var moment = require('moment');
var app = require('../app');
var db = require('../config/db');

//로그인 여부 확인
const checkLogin = require('../middlewares/check').checkLogin

var router = express.Router();

//app.use(bodyParser.json())


/*const client = mysql.createConnection({
  host:'localhost',
  port:3306,
  user:'reserve',
  password:'reserve',
  database:'hospital'
});*/
/*
app.use(function(req,res,next)
{
  res.locals.req = req;
  
  if(req.user)
  {
      db.query('SELECT * FROM HOSPITAL WHERE ID = (SELECT ID FROM HOSPITAL WHERE UID=?)',[req.user.uid],function(err,results){
        console.log(results);
      });
    res.locals.hospital = req.user;
  }
  else
  {
    res.locals.hospital = null;
  }
  next();
});*/


/* GET home page. */
router.get('/', function(req, res, next) {
    
    var inputSidoCode = req.query.sido;
    var inputGunguCode = req.query.gungu;
    var inputHospitalName = req.query.search_text;
    var inputSubject = req.query.subject;

    var numPerPage = parseInt(req.query.npp,10) || 5;
    var page = parseInt(req.query.page,10) || 1;
    
    var numPages;
    var skip = (page-1) * numPerPage;
    var limit = skip + ',' + numPerPage;

    hospitalQuery = 'select * from \
                    (\
                    select c.*,d.usido,d.ugungu,d.udong,(\
                                select group_concat(a.subject_id) as subjects from ( select a.hospital_id as hospital_id,a.subject_id, b.subject as subject from hospital_subject a,subject b where a.subject_id = b.code) a where a.hospital_id=c.id group by a.hospital_id\
                                ) as subject_code,\
                                (\
                                select group_concat(a.subject) as subjects from ( select a.hospital_id as hospital_id,a.subject_id, b.subject as subject from hospital_subject a,subject b where a.subject_id = b.code) a where a.hospital_id=c.id group by a.hospital_id\
                                ) as subjects,\
                                (select avg(eval_score) from reserve a where a.hospital_id=c.id group by hospital_id) as score\
                                from hospital c,user d where c.uid=d.uid\
                    ) e';

    var pagenationQuery = 'select count(*) as numRows from \
                    (\
                    select c.*,d.usido,d.ugungu,d.udong,(\
                                select group_concat(a.subject_id) as subjects from ( select a.hospital_id as hospital_id,a.subject_id, b.subject as subject from hospital_subject a,subject b where a.subject_id = b.code) a where a.hospital_id=c.id group by a.hospital_id\
                                ) as subject_code,\
                                (\
                                select group_concat(a.subject) as subjects from ( select a.hospital_id as hospital_id,a.subject_id, b.subject as subject from hospital_subject a,subject b where a.subject_id = b.code) a where a.hospital_id=c.id group by a.hospital_id\
                                ) as subjects,\
                                (select avg(eval_score) from reserve a where a.hospital_id=c.id group by hospital_id) \
                                from hospital c,user d where c.uid=d.uid\
                    ) e';
    var reserveWhereQuery='';
    
    if(inputSubject && inputSubject!=-1)
        reserveWhereQuery+=" WHERE e.SUBJECT_CODE LIKE '%" + inputSubject + "%'";
    else
        reserveWhereQuery+=" WHERE e.SUBJECT_CODE IS NOT NULL";

    if(req.query.search_text)
        reserveWhereQuery+= " and e.name like '%" + req.query.search_text +"%' ";

    if(req.query.sido)
        reserveWhereQuery+= " and e.usido=" + req.query.sido;

    if(req.query.gungu)
        reserveWhereQuery+= " and e.ugungu=" + req.query.gungu;

    hospitalQuery+=reserveWhereQuery;
    pagenationQuery+=reserveWhereQuery;
    
    
    db.query(pagenationQuery,function(err,results)
    {
        if(err)
            throw err;

        
        numRows = results[0].numRows;
        numPages = Math.ceil(numRows/numPerPage);
        
        //console.log('number of pages : ', numPages);

        
        subjectQuery = 'SELECT * FROM subject'
        sidoQuery = "";
        gunguQuery = "";
        breadQuery = "";
        var breadCrumbs = {sidoCode:'',sidoName:'',gunguCode:'',gunguName:''}
    
        

        hospitalQuery += ' ORDER BY ID LIMIT ' + limit;

        //시도코드가 없으면(시도를 보여주고)
        if(!inputSidoCode && !inputGunguCode)//전국
            sidoQuery = 'select sidoCode,sidoName from sido group by sidoCode,sidoName having count(*) > 1';
        else if(inputSidoCode && !inputGunguCode)//시도를 눌렀을때
        {
            sidoQuery='';
            gunguQuery = 'select sidoCode,sidoName,gunguCode,gunguName from sido where sidoCode=' + inputSidoCode +  ' group by sidoCode,sidoName,gunguCode,gunguName having count(*)>1 order by gunguName'
            breadQuery = "select sidoCode,sidoName from sido where sidocode=" + inputSidoCode;
        }
        else if(inputSidoCode && inputGunguCode)//군구를 눌렀을때
        {
            sidoQuery='';
            gunguQuery = 'select sidoCode,sidoName,gunguCode,gunguName from sido where sidoCode=' + inputSidoCode +  ' group by sidoCode,sidoName,gunguCode,gunguName having count(*)>1 order by gunguName'
            breadQuery = "select sidoCode,sidoName,gunguCode,gunguName from sido where gunguCode="+inputGunguCode;
        }
        //console.log(hospitalQuery);
        async.parallel(
            {
                hospitalList: (callback) => db.query(hospitalQuery, callback),
                subjectList: (callback) => db.query(subjectQuery, callback),
                sidoList: (callback) => { (sidoQuery!='')? db.query(sidoQuery, callback):callback(null,[])},
                gunguList : (callback) => { (gunguQuery!='')? db.query(gunguQuery,callback):callback(null,[]) },
                breadList : (callback) =>{ (breadQuery!='')? db.query(breadQuery,callback):callback(null,[]) }
            }, (error, results) => {
                if(error)
                    throw error;
                
                var responsePayload = {
                    results : results['hospitalList'][0],
                }
                if (page <= numPages) {
                    responsePayload.pagination = {
                      current: page,
                      perPage: numPerPage,
                      previous: page > 0 ? page - 1 : undefined,
                      next: page < numPages - 1 ? page + 1 : undefined,
                      numPages : numPages,
                      numRows : numRows,
                    }
                  }
                else responsePayload.pagination = {
                    err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                }
                console.log(responsePayload.pagination);
                res.render('hospital_list', {
                    //data:results['hospitalList'][0],
                    data:responsePayload,
                    subject:results['subjectList'][0],
                    sido:(typeof results['sidoList'][0]!="undefined")?results['sidoList'][0]:[],
                    gungu:(typeof results['gunguList'][0]!="undefined")?results['gunguList'][0]:[],
                    breadCrumbs:(typeof results['breadList'][0]!="undefined") ? results['breadList'][0][0]:[],
                });
            });
    });
    
  //res.render('Hospital', { title: 'Hospital' });
});

router.get('/test/',function(req,res){
    res.render('temp.ejs');
});

//평가
router.post('/reserve_score/',function(req,res){
    var reserve_id = req.body.reserve_id;

    //query = "UPDATE RESERVE SET EVAL_SCORE="+ score + " WHERE ID="+reserve_id;
    query = "SELECT EVAL_SCORE as score FROM RESERVE WHERE ID=" + reserve_id;
    db.query(query,function(error,rows,fields){
        if(error)
            throw error;
        res.send({score:rows[0].score});
    });
    //res.redirect('back');
});

//평가
router.post('/reserve_registscore/',function(req,res){
    var reserve_id = req.body.reserve_id;
    var score = req.body.score;

    query = "UPDATE RESERVE SET EVAL_SCORE="+ score + " WHERE ID="+reserve_id;
    db.query(query,function(error,rows,fields){
        if(error)
            throw error;
        //res.send({result:true,data:results});
    });
    
    //res.redirect('back');
});

//예약 취소
router.post('/reserve_delete/',function(req,res){
    var id = req.body.id;
    query = "DELETE FROM reserve WHERE ID="+id;
    db.query(query,function(error,rows,fields){
        if(error)
            throw error;
        
    });
    res.redirect('back');
});

router.get('/reserve_list/',function(req,res,next){
    query = "select *, if(to_days(now())>to_days(date),if(to_days(now())-to_days(date)<=3,'평가','평가불가'),'예약취소') as note from  (\
                select id,hospital_id,\
                    (select name from hospital where id=a.hospital_id) as hospital_name,\
                user_id,(select name from family where id=a.family_id) as family,(select name from doctors where id=a.doctor_id) as doctor,\
                date,(select time from times where id=time_id) as time,eval_score \
            from reserve a where user_id=" + req.user.uid + ") c order by date desc,time asc";

    db.query(query,function(error,rows,fields){
        if(error)
        {
            throw error;
        }
        res.render('reserve_list',{reserve_list:rows,moment:moment})
    });
});

router.post('/reserve/',function(req,res,next){
    if(!req.body.doctors || !req.body.time || !req.body.date)       
    {
        req.flash('error','항목을 모두 선택해 주세요.');    
        return res.redirect('back');
    }

    data = {
        hospital_id:req.body.hospital_id, 
        family_id:(req.body.family=='')? null:req.body.family,
        doctor_id:req.body.doctors,
        date : req.body.date,
        time_id : req.body.time,
        user_id : req.user.uid
    };
    
    db.query('INSERT INTO reserve SET ?',data,function(err,results,fields){
        if(err)
        {
            console.log(err);
            throw err;
        }
        req.flash('success','예약이 완료 되었습니다.');
    });
    res.redirect('/hospital/reserve_list');
});

router.post('/reserve/ajax',function(req,res,next){
    var hospital_id = req.body.hospital_id;
    var doctor = req.body.doctor;
    var date = req.body.date;

    timeQuery = 'SELECT * FROM times WHERE HOSPITAl_ID=' + hospital_id;
    timeQuery += ' AND ID NOT IN (SELECT DISTINCT TIME_ID FROM RESERVE WHERE HOSPITAL_ID=' + hospital_id;

    if(doctor)
        timeQuery += ' AND DOCTOR_ID=' + doctor;
    if(date)
        timeQuery += " AND DATE='" + date + "'";
    timeQuery += ')';

    timeQuery += ' ORDER BY TIME'

    db.query(timeQuery,(error,results)=>{
        res.send({result:true,data:results});
    });
});

router.get('/profile/:id',function(req,res,next){
    var id = req.params.id;

    hospital_Query = 'select * from (select c.id, (c.name) as uname, c.dong, (c.addr) as uaddress, (c.tel) as uphone, c.email, c.homepage, c.notice, d.ishospital, d.usido, d.ugungu, d.udong,(select group_concat(a.subject_id) as subjects from (select a.hospital_id as hospital_id, a.subject_id, b.subject as subject \
        from hospital_subject a,subject b where a.subject_id = b.code) a where a.hospital_id=c.id group by a.hospital_id) as subject_code, (select group_concat(a.subject) as subjects from ( select a.hospital_id as hospital_id,a.subject_id, b.subject as subject \
       from hospital_subject a,subject b where a.subject_id = b.code) a where a.hospital_id=c.id group by a.hospital_id) as subjects, (select group_concat(a.time) as times from ( select a.id as hospital_id, b.time as time\
       from hospital a, times b where a.id = b.hospital_id) a where a.hospital_id=c.id group by a.hospital_id) as time, (select avg(eval_score) from reserve cc where cc.hospital_id=c.id group by hospital_id) as score\
       from hospital c,user d where c.uid=d.uid) e where id = ' + parseInt(id);
    doctor_Query = 'select name, description from doctors where hospital_id ='+ parseInt(id);

    async.parallel({
        info_hos : (callback)=>db.query(hospital_Query, callback),
        info_doc : (callback)=>db.query(doctor_Query, callback)
    },(err,results)=>{
        res.render('profile.ejs',{
            data_hos : results['info_hos'][0][0],
            data_doc : results['info_doc'][0]
        });
    });
});

router.get('/reserve/:id',checkLogin,function(req,res,next){
    var id = req.params.id;
    var user = req.session.passport.user[0];
    doctorQuery = 'SELECT * FROM DOCTORS WHERE HOSPITAL_ID=' + id;
    timeQuery = 'SELECT * FROM TIMES WHERE HOSPITAL_ID=' + id;
    familyQuery = 'SELECT * FROM FAMILY WHERE USER_ID=' + req.user.uid;
    async.parallel(
        {
            doctorList : (callback)=>db.query(doctorQuery,callback),
            timelist : (callback)=>db.query(timeQuery,callback),
            familyList : (callback)=>db.query(familyQuery,callback),
        },(error,results)=>
            {
                res.render('reserve',{
                        hospital_id:id,
                        doctors:results['doctorList'][0],
                        times:results['timelist'][0],
                        family:results['familyList'][0],
                });       
            });
});


router.get('/dashboard/notice',checkLogin,function(req,res,next){
    db.query('select * from hospital where hospital.uid='+req.user.uid,function(err,result,fields){
        if(err){
            console.log(err);
            throw err;
        }else{    
            res.render('dashboard_notice.ejs',{
                hos_data : result[0]
            });
        }
    });
});

router.post('/dashboard/notice',checkLogin,function(req,res,next){
    query = "UPDATE hospital SET notice=? where uid = ?";
    db.query(query,[req.body.notice,req.user.uid],function(error,rows,fields){
        if(error) throw error;
        else res.redirect('/hospital/dashboard');
    });
});

router.get('/dashboard/update',checkLogin,function(req,res,next){
    if(req.body.ishospital || req.user.ishospital){
        console.log('병원 계정 사용자.');
        db.query('select * from hospital where email=?',req.user.uuid,function(err,hos_result,fields){
            if(err) console.log(err);
            else{
                hos_sub_Query = 'select subject_id from hospital_subject where hospital_id=?';
                doctor_Query = 'select name from doctors where hospital_id=?';
                time_Query = 'select time from times where hospital_id=?';
                subject_Query = 'select * from subject';

                async.parallel(
                    {
                        hos_sub_data: (callback) => db.query(hos_sub_Query,hos_result[0].id,callback),                                 
                        doctors_data: (callback) => db.query(doctor_Query,hos_result[0].id,callback),                                
                        times_data: (callback) => db.query(time_Query,hos_result[0].id,callback),
                        sub_data: (callback) => db.query(subject_Query,callback)        
                    },(err, results) => {                                
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.render('dashboard_hospital.ejs', {                     
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
});

router.post('/dashboard/update',checkLogin,function(req,res,next){
            // var user_up = 'UPDATE user SET uname=?, uphone=?, usido=?, ugungu=?, udong=?, uzip=?, uaddress=? WHERE uid=?';
            // var hos_up =  'UPDATE hospital SET name=?, dong=?, addr=?, tel=?, homepage=? WHERE uid=?';

            // var user_data=[
            //     req.body.name,
            //     req.body.tel,
            //     req.body.sido,
            //     req.body.gungu,
            //     req.body.dong,
            //     req.body.post1,
            //     req.body.addr + ' ' + req.body.addr_,
            //     req.user.uid];
            // var hos_data=
            //     [req.body.name,
            //     req.body.dong,
            //     req.body.addr + ' ' + req.body.addr_,
            //     req.body.tel,
            //     req.body.homepage,
            //     req.user.uid];

            // //update
            // async.parallel({
            //     user_update : (callback) => db.query(user_up,user_data,callback),
            //     hos_update : (callback) => db.query(hos_up,hos_data,callback)
            // },(err,results)=>{
            //     if(err){
            //         console.log(err);
            //         throw err;
            //     }
            //     else{
            //         console.log("user & hospital 정보 Update.");
            //         var hos_id = 'SELECT id FROM hospital WHERE uid=' + req.user.uid ;
            //         var hos_sub_del = 'DELETE FROM hospital_subject WHERE hospital_id = (' + hos_id + ')'; 
            //         var times_del = 'DELETE FROM times WHERE hospital_id  = (' + hos_id + ')'; 
            //         var hosp_inst_id = '';

            //         //delete
            //         async.parallel({
            //             hos_sub_delete : (callback) => db.query(hos_sub_del,callback),
            //             time_delete : (callback) => db.query(times_del,callback)
            //         },(err,results)=>{
            //             if(err)
            //                 console.log(err);
            //             else{
            //                 console.log('Hospital 관련 subject,time 삭제.');
            //                 var hosp_inst_id = results['hos_int_id'][0][0].id;
          
            //                 var hos_sub_len = req.body.subjects.length;
            //                 var time_len = req.body.times.length;

            //                 console.log(hos_sub_len,dr_len, time_len);

            //                 //insert
            //                 async.parallel([
            //                     hos_sub_add,
            //                     time_add
            //                 ],function (err, results){
            //                     if (err) console.log(err)
            //                     else console.log('Hospital 관련 subject,time 새로 추가.');
            //                 });
                        
            //                 function hos_sub_add(callback){
            //                     if (hos_sub_len==1){
            //                         var hos_subject = [
            //                             parseInt(hosp_inst_id),
            //                             req.body.subjects];

            //                         console.log(hos_subject);
            //                         db.query('INSERT INTO hospital_subject (hospital_id, subject_id) VALUES (?, ?)',hos_subject,function(err,sub_result){
            //                             if(err){
            //                                 console.log(err);
            //                                 throw err;
            //                             }
            //                             else return (callback);
            //                         });
            //                     }else{
            //                         for ( var i=0; i<hos_sub_len;i++){
                                        
            //                             var hos_subject = [
            //                                 parseInt(hosp_inst_id),
            //                                 req.body.subjects[i]];

            //                             console.log(hos_subject);
            //                             db.query('INSERT INTO hospital_subject (hospital_id, subject_id) VALUES (?, ?)',hos_subject,function(err,sub_result){
            //                                 if(err){
            //                                     console.log(err);
            //                                     throw err;
            //                                 }
            //                                 else return (callback);
            //                             });
            //                         }
            //                     }
            //                 }
            //                 function time_add(callback){
            //                     if(time_len==1){
            //                         var hos_time = [
            //                             parseInt(hosp_inst_id),
            //                             req.body.times];

            //                         console.log(hos_time);

            //                         db.query('INSERT INTO times (hospital_id, time) VALUES (?, ?)',hos_time,function(err,time_result){
            //                             if(err){
            //                                 console.log(err);
            //                                 throw err;
            //                             }
            //                             else return (callback);
            //                         });
            //                     }else{
            //                         for ( var i=0; i<time_len;i++){

            //                             var hos_time = [
            //                                 parseInt(hosp_inst_id),
            //                                 req.body.times[i]];

            //                             console.log(hos_time);

            //                             db.query('INSERT INTO times (hospital_id, time) VALUES (?, ?)',hos_time,function(err,time_result){
            //                                 if(err){
            //                                     console.log(err);
            //                                     throw err;
            //                                 }
            //                                 else return (callback);
            //                             });
            //                         }
            //                     }
            //                 }
            //             }
            //         });
            //         res.redirect('/hospital/dashboard');
            //     }
            // });
});

router.get('/dashboard/doctor',checkLogin,function(req,res,next){
    
    var doc_sel = 'select * from doctors where hospital_id = ( select id from hospital where uid = ' + req.user.uid + ')';
    var hos_sub_sel = 'select * from hospital_subject where hospital_id = ( select id from hospital where uid = ' + req.user.uid + ')';
    var sub_sel = 'select * from subject';

    async.parallel(
    {
        data_doctor : (callback) => db.query(doc_sel, callback),
        data_hos_sub : (callback) => db.query(hos_sub_sel, callback),
        data_subjects : (callback) => db.query(sub_sel, callback)
    },(err,results)=>{
        if(err) console.log(err)
        else{
            var data = {
                doctors : results['data_doctor'][0],
                hos_sub : results['data_hos_sub'][0],
                subjects : results['data_subjects'][0]
            }
            res.render('dashboard_doctor.ejs',{data : data});
        }
    });
});

router.post('/dashboard/doctor',checkLogin,function(req,res,next){
        //({
            if(error) throw error;
            else res.redirect('/hospital/dashboard');
        //});
});

router.get('/dashboard',checkLogin,function(req,res,next){
    reserveWhereQuery = ' (SELECT ID FROM HOSPITAL WHERE UID='+req.user.uid + ') ';
    todayQuery = 'SELECT (SELECT COUNT(*) FROM RESERVE WHERE HOSPITAL_ID='+ reserveWhereQuery +'AND \
    TO_DAYS(DATE)=TO_DAYS(NOW())) AS today,(SELECT COUNT(*) FROM RESERVE WHERE HOSPITAL_ID='+reserveWhereQuery + 'AND TO_DAYS(DATE)=TO_DAYS(DATE_ADD(NOW(), INTERVAL+1 DAY))) AS tommorow'
    async.parallel(
        {
            todayList : (callback)=>db.query(todayQuery,callback),
        },(error,results)=>{
            res.render('dashboard',{
                    todayList:results['todayList'][0],
                    moment:moment
            });       
        });
});

router.get('/dashboard/chart',checkLogin,function(req,res,next){
    res.render('dashboard_chart');
});

router.get('/dashboard/reserve',checkLogin,function(req,res,next){
    reserveQuery = "select id, hospital_id, (select name from hospital where id=a.hospital_id) as hospital_name,(ifnull(family_id,'본인'))as name,doctor_id,(select name from doctors where id=a.doctor_id) as doctor_name,\
    date_format(date,'%Y-%m-%d') as date,(select time from times where id=a.time_id) as time from reserve a "
    reserveContQuery = "select count(id) as numRows from reserve";

    doctorQuery = "select id,name from doctors";

    reserveWhereQuery = ' where hospital_id=(select id from hospital where uid='+req.user.uid + ') ';
    doctorQuery+= reserveWhereQuery;

    if(req.query.minDate)
        reserveWhereQuery += ' and to_days(date)>=to_days(\''+req.query.minDate + '\')';
    else
        reserveWhereQuery += ' and to_days(date)>=to_days(now())';
    if(req.query.maxDate)
        reserveWhereQuery+= ' and to_days(date)<=to_days(\''+req.query.maxDate + '\')';
    else
        reserveWhereQuery+= ' and to_days(date)<=to_days(now())';

    if(req.query.doctor && req.query.doctor!='-1')
        reserveWhereQuery+= ' and doctor_id=\'' + req.query.doctor+'\'';
    
    
    reserveQuery+= reserveWhereQuery;
    reserveQuery += ' order by date desc, time desc'

    reserveContQuery += reserveWhereQuery;
    console.log(reserveQuery);
    
    var numPerPage = parseInt(req.query.npp,10) || 6;
    var page = parseInt(req.query.page,10) || 1;
    
    var numPages;
    var skip = (page-1) * numPerPage;
    var limit = skip + ',' + numPerPage;

    db.query(reserveContQuery,function(err,results){
        if(err)
            throw err;
            
        numRows = results[0].numRows;
        numPages = Math.ceil(numRows/numPerPage);
        console.log('numPages',numPages);
        reserveQuery += ' LIMIT ' + limit;
        
        async.parallel(
            {
                reserveList : (callback)=>db.query(reserveQuery,callback),
                doctorList : (callback)=>db.query(doctorQuery,callback),
            },(error,results)=>
                {
                    
                    var responsePayload = {
                        results : results['reserveList'][0]
                    }
                    if(page<=numPages)
                    {
                        responsePayload.pagination = {
                            current: page,
                            perPage: numPerPage,
                            previous: page > 0 ? page - 1 : undefined,
                            next: page < numPages - 1 ? page + 1 : undefined,
                            numPages : numPages
                        }
                    }
                    else responsePayload.pagination = {
                        err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                    }
                    console.log(responsePayload.pagination);
                    res.render('dashboard_reserve',{
                        data:responsePayload,
                        doctorList:results['doctorList'][0],
                    });       
            });
    });
    
});

router.post('/reserve_chart',checkLogin,function(req,res,next){
    console.log(req.body);
    doctorQuery = 'select distinct(doctor_id),(select name from doctors where id=doctor_id) as doctor_name from reserve WHERE HOSPITAL_ID =\
    (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS("' + req.body.minDate + '") AND TO_DAYS("'+req.body.maxDate+'")'

    query = 'SELECT DATE_FORMAT(DATE,"%Y-%m-%d") AS period,doctor_id,COUNT(*) AS count FROM RESERVE WHERE HOSPITAL_ID =\
    (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS("' + req.body.minDate + '") AND TO_DAYS("' + req.body.maxDate + '") GROUP BY DATE,doctor_id';
    chartQuery = 'select period %s from \
    (\
    SELECT DATE_FORMAT(DATE,"%Y-%m-%d") AS period,DOCTOR_ID,COUNT(*) AS count FROM RESERVE WHERE HOSPITAL_ID =\
        (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS("' + req.body.minDate +'") AND TO_DAYS("' + req.body.maxDate + '") GROUP BY DATE,DOCTOR_ID\
    ) a group by period';
    
    db.query(doctorQuery , [req.user.uid],(error,doctorList)=>{
        if(error)
            throw error;
        casewhenQuery = '(select name from doctors where id=%d) as doctor_name,sum(case when doctor_id=%s then count end) as d%s';
        caseWhenString = '';
        doctorList.forEach(function(item,index){
            caseWhenString += (','+util.format(casewhenQuery,item.doctor_id,item.doctor_id,index));
        });
        chartQuery = util.format(chartQuery,caseWhenString);
        console.log(chartQuery)
        db.query(chartQuery,[req.user.uid],(error,results)=>{
            if(error)
                throw error;
            res.send({doctorList:doctorList,data:results});
        });
    });
    
});

router.post('/reserve_chart_total',checkLogin,function(req,res,next){
    console.log(req.body);
    /*
    doctorQuery = 'select distinct(doctor_id),(select name from doctors where id=doctor_id) as doctor_name from reserve WHERE HOSPITAL_ID =\
    (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS("' + req.body.minDate + '") AND TO_DAYS("'+req.body.maxDate+'")'

    query = 'SELECT DATE_FORMAT(DATE,"%Y-%m-%d") AS period,doctor_id,COUNT(*) AS count FROM RESERVE WHERE HOSPITAL_ID =\
    (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS("' + req.body.minDate + '") AND TO_DAYS("' + req.body.maxDate + '") GROUP BY DATE,doctor_id';
    */
    chartQuery = 'SELECT DATE_FORMAT(DATE,"%Y-%m-%d") AS period,COUNT(*) AS count FROM RESERVE WHERE HOSPITAL_ID =\
    (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS(DATE_ADD(NOW(),interval -10 day)) AND TO_DAYS(date_add(now(),interval +1 DAY)) GROUP BY DATE ORDER BY 1';
    
    db.query(chartQuery,[req.user.uid],(error,results)=>{
        if(error)
            throw error;
        res.send({data:results});
    });
    /*
    db.query(doctorQuery , [req.user.uid],(error,doctorList)=>{
        if(error)
            throw error;
        casewhenQuery = '(select name from doctors where id=%d) as doctor_name,sum(case when doctor_id=%s then count end) as d%s';
        caseWhenString = '';
        doctorList.forEach(function(item,index){
            caseWhenString += (','+util.format(casewhenQuery,item.doctor_id,item.doctor_id,index));
        });
        chartQuery = util.format(chartQuery,caseWhenString);
        console.log(chartQuery)
        db.query(chartQuery,[req.user.uid],(error,results)=>{
            if(error)
                throw error;
            res.send({doctorList:doctorList,data:results});
        });
    });
    */
    
    
});
module.exports = router;