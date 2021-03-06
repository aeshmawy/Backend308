var express = require('express');
var router = express.Router();

var validator = require('validator');
var session = require('express-session');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var User =  require("../Schema/User");

/**
 * @swagger
 * /register:
 *  post:
 *    description: username and password are required. usertype is not. (default for isSM and isPM is false)
 *    tags:
 *      - log
 *    parameters:
 *     - in: body
 *       name: email
 *       schema:
 *         type: object
 *         required:
 *          - email
 *          - password
 *         properties:
 *           email: 
 *             type: string
 *           password:
 *             type: string
 *           userType:
 *             type: number
 *             default: 1
 *           fullName:
 *             type: string
 *             default: John Doe
 *           taxID:
 *              type: string
 *              default: 12345678
 *           address: 
 *              type: string
 *              default: Coolio street 1337
 *           city: 
 *              type: string
 *              default: istanbul
 *           country: 
 *              type: string
 *              default: turkey
 *    responses:
 *      '200':
 *        description: Successful Registration(User has been added to the database)
 *      '400':
 *        description: Username or password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */


router.post('/' , async (req,res) =>
{
  
  
  var newuser = new User();
  if(req.body.email)
  {
    if(validator.isEmail(req.body.email))// somestring@somestring.xyz
    {
      if(await User.exists({ email: req.body.email}) )
      {return res.status(401).send("Email must be unique.")}
      console.log("I am here")
      newuser.email = req.body.email;
    }
    else
    {
      return res.status(401).send("Invalid email.")
    }
  }
  else {return res.status(400).send("Please insert a Email");}
  
  
  
  newuser.userType = 1;//only customers can sign up using this api

  if(req.body.password)
  {
    newuser.password = await bcrypt.hash(req.body.password, 10); 
  }
  else {return res.status(400).send("Please insert a password.");}
  
  if(req.body.fullName && req.body.taxID && req.body.address && req.body.city && req.body.country)
  {
    newuser.fullname = req.body.fullName;
    newuser.taxID = req.body.taxID;
    newuser.address = req.body.address;
    newuser.city = req.body.city;
    newuser.country = req.body.country;
  }

   await newuser.save((err, Saveduser) => {

    if(err)
    { 
      //console.log(err);
      res.status(500).send("Something went wrong")
    }
    else
    {
      var userinfo = newuser;
      var token = jwt.sign({newuser} , "tempprivatekey" , { expiresIn: "1h" });
      req.session.loggedIn = true;
      userinfo.password = null;
      req.session.user = userinfo;
      
      res.status(200).json({msg :  "User has been successfully added" , token,userinfo  })
  
    }
    }); 
})



module.exports = router;