var express = require('express');
var router = express.Router();

var validator = require('validator');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var User =  require("../Schema/User");

/**
 * @swagger
 * /register:
 *  post:
 *    description: username and password are required. usertype is not. (default for isSM and isPM is false)
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
 *              
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
    if(validator.isEmail(req.body.email))
    {
      if(await User.exists({ email: req.body.email}) )
      {return res.status(401).send("Email must be unique.")}
      newuser.email = req.body.email;
    }
    else
    {
      return res.status(401).send("Invalid email.")
    }
  }
  else {return res.status(400).send("Please insert a Email");}
  
  
  
  if(req.body.userType)
  {newuser.userType = req.body.userType;}

  if(req.body.password)
  {
    newuser.password = await bcrypt.hash(req.body.password, 10); 
  }
  else {return res.status(400).send("Please insert a password.");}
  
  
   newuser.save((err, Saveduser) => {

    if(err)
    { 
      //console.log(err);
      res.status(500).send("Something went wrong")
    }
    else
    {
      var userinfo = newuser;
      var token = jwt.sign({newuser} , "tempprivatekey" , { expiresIn: "1h" });
      res.status(200).json({msg :  "User has been successfully added" , token,userinfo  })
  
    }
    }); 
})



module.exports = router;