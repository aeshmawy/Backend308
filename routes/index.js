var express = require('express');
var router = express.Router();
var User =  require("../lib/User");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', (req,res) => {
var username = req.body.username;
var password = req.body.password;

User.findOne({username: username, password: password}, (err,founduser) =>{
if(err)
{
  console.log(err);
  return res.status(500).send("wrong information")
}
if(!founduser)
{
  return res.status(404).send("User does not exist.");
}

  return res.status(200).send("Successful Log in");
})


} );


router.post('/register' , (req,res) =>
{
  
  var newuser = new User();
  newuser.username = req.body.username;
  newuser.password = req.body.password;
  newuser.firstname = req.body.firstname;
  newuser.lastname = req.body.lastname;

  newuser.save((err, Saveduser) => {

  if(err)
  { 
    console.log(err);
    res.status(500).send("wrong information")
  }
  else{
    res.status(200).send("User has been successfully added")

  }
  });
})

module.exports = router;
