var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');
var User =  require("../Schema/User");


router.post('/', async (req,res) => {
    var username = req.body.username;
    var password = req.body.password;
    if(username && password)
    {
    var founduser = await User.findOne({username: username}, (err,founduser) =>
    {
      if(err)
      {
        console.log(err);
        return res.status(500).send("wrong information")
      }
      if(!founduser)
      {
        return res.status(404).send("User does not exist.");
      }
      else if(founduser)
      {
        return founduser;
      }
      
    });
    
    if(await bcrypt.compare(password,founduser.password))
    {
      return res.status(200).send("Successful Log in");
    }
    else
    {
      return res.status(400).send("Wrong Password");
    }
  }
    
});

module.exports = router;