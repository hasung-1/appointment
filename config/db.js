var mysql = require('mysql');

//MySQL 사용 설정
const options = {
    host:'61.42.20.5',
    port:3306,
    user:'reserve',
    password:'reserve',
    database:'hospital'
  };
  
const conn = mysql.createConnection(options);

conn.connect((err)=>{
    if(err) throw err;
    console.log('데이터베이스 Connected');
    
});

module.exports = conn;
  