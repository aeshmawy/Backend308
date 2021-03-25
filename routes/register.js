var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var User =  require("../Schema/User");


router.post('/' , async (req,res) =>
{
  

  var newuser = new User();
  newuser.username = req.body.username;
  
  if(req.body.userType)
  newuser.userType = req.body.userType;

  if(req.body.password)
  {
    newuser.password = await bcrypt.hash(req.body.password, 10); 
  }
  
  if(req.body.username && req.body.password)
  {
  newuser.save((err, Saveduser) => {

    if(err)
    { 
      //console.log(err);
      res.status(500).send("wrong information")
    }
    else
    {
      res.status(200).send("User has been successfully added")
  
    }
    });
  }
  else
  {
    res.status("400").send("Username or Password missing.");
  }
  
})







module.exports = router;