var express = require('express');
var router = express.Router();

var fs = require('fs');
var ejs = require('ejs');
const mysql = require('mysql');


/* GET home page. */
router.get('/', function(req, res, next) {
  var loginSuccess;
  res.render('index', { title:'1',login_success: 'Express' });
});

module.exports = router;
