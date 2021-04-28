var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');//todo: remove
var bcrypt = require('bcrypt');
var User =  require("../Schema/User");
var session = require('express-session');



/**
 * @swagger
 * /login:
 *   post:
 *    description: Give a json file containing a username and password. 
 *    tags: 
 *      - log
 *      - test
 *    parameters:
 *       - in : body
 *         name : SomeUser
 *         schema: 
 *          type: object
 *          properties:
 *            email:
 *              type: string
 *            password:
 *              type: string
 *       
 *    responses:
 *      '200':
 *        description: A successful Login
 *      '404': 
 *        description: Username does not exist in database
 *      '400':
 *        description: Username exists but the password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */
 router.post('/', async (req,res) => {
  
  var email = req.body.email;
  var password = req.body.password;
  
  
  if(email && password)
  {
    
  var userInfo = await User.findOne({email: email}, (err,userInfo) =>
  {
    if(err)
    {
      console.log(err);
      
      return res.status(500).send("Wrong information")
    }
    if(!userInfo)
    {
      
      return userInfo;
    }
    else if(userInfo)
    {
      
      return userInfo;
    }
    
  });
  
  if(userInfo)
  {
    if(await bcrypt.compare(password,userInfo.password) )
    {
      //return a jwt token here
      req.session.loggedIn = true;
      userInfo.password = null;//deleting the password
      req.session.user = userInfo;//storing userinfo in cookie
      //console.log(req.session.user);
      jwt.sign({userInfo , loggedIn : true} , "tempprivatekey" , { expiresIn: "1h" },
      (err, token) => {
        if(err)
        {
          return res.status(403).send("Something went wrong")
        }
        else
        {
          return res.status(200).json({ msg: "Log in is successful", status:200, token: token,userInfo , loggedIn : true})
        }
      });
      
    }
    else
    {
      return res.status(400).send("Wrong Password");
    }
  }
  else
  {
    return res.status(400).send("User does not exist");
  }
}
  
});



module.exports = router;
