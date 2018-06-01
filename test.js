const async = require("async")
const mysql = require('mysql');

const client = mysql.createConnection({
    host:'localhost',
    port:3306,
    user:'reserve',
    password:'reserve',
    database:'hospital'
});
 
async.parallel({
    data: (callback) => client.query('SELECT * FROM HOSPITAL', callback),
    subject: (callback) => client.query('SELECT * FROM SUBJECT', callback),
    sido: (callback) => client.query('SELECT * FROM SIDO', callback)
}, (error, results) => {
    console.log(JSON.stringify(results, null, 2))
})