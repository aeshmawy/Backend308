var express = require('express');
var router = express.Router();

var User =  require("../Schema/User");
var database = require("../Schema/dbconnect.js");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});






module.exports = router;
