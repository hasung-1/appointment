
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
                      numPages : numPages
                    }
                  }
                else responsePayload.pagination = {
                    err: 'queried page ' + page + ' is >= to maximum page number ' + numPages
                }
                
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

router.get('/dashboard',checkLogin,function(req,res,next){
    reserveWhereQuery = ' (SELECT ID FROM HOSPITAL WHERE UID='+req.user.uid + ') ';
    todayQuery = 'SELECT (SELECT COUNT(*) FROM RESERVE WHERE HOSPITAL_ID='+ reserveWhereQuery +'AND \
    TO_DAYS(DATE)=TO_DAYS(NOW())) AS today,(SELECT COUNT(*) FROM RESERVE WHERE HOSPITAL_ID='+reserveWhereQuery + 'AND TO_DAYS(DATE)=TO_DAYS(DATE_ADD(NOW(), INTERVAL+1 DAY))) AS tommorow'
    async.parallel(
        {
            todayList : (callback)=>db.query(todayQuery,callback),
        },(error,results)=>
            {
                res.render('dashboard',{
                        todayList:results['todayList'][0],
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
    
    var numPerPage = parseInt(req.query.npp,10) || 5;
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
    doctorQuery = 'select distinct(doctor_id),(select name from doctors where id=doctor_id) as doctor_name from reserve WHERE HOSPITAL_ID =\
    (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS(DATE_ADD(NOW(), INTERVAL-10 DAY)) AND TO_DAYS(NOW())'

    query = 'SELECT DATE_FORMAT(DATE,"%Y-%m-%d") AS period,doctor_id,COUNT(*) AS count FROM RESERVE WHERE HOSPITAL_ID =\
    (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS(DATE_ADD(NOW(), INTERVAL-5 DAY)) AND TO_DAYS(NOW()) GROUP BY DATE,doctor_id';
    chartQuery = 'select period %s from \
    (\
    SELECT DATE_FORMAT(DATE,"%Y-%m-%d") AS period,DOCTOR_ID,COUNT(*) AS count FROM RESERVE WHERE HOSPITAL_ID =\
        (SELECT ID FROM HOSPITAL WHERE UID=?) AND TO_DAYS(DATE) BETWEEN TO_DAYS(DATE_ADD(NOW(), INTERVAL-10 DAY)) AND TO_DAYS(NOW()) GROUP BY DATE,DOCTOR_ID\
    ) a group by period';
    test = [
        { year: '2008', value: 20 },
        { year: '2009', value: 10 },
        { year: '2010', value: 5 },
        { year: '2011', value: 5 },
        { year: '2012', value: 20 }
      ];
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
module.exports = router;