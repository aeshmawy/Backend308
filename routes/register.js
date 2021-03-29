var express = require('express');
var router = express.Router();

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
 *       name: user
 *       schema:
 *         type: object
 *         required:
 *          - username
 *          - password
 *         properties:
 *           username: 
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
  if(req.body.username)
  {
    
    if(await User.exists({ username: req.body.username}) )
    {return res.status(400).send("Username must be unique.")}
    newuser.username = req.body.username;
  }
  else {return res.status(400).send("Please insert a username");}
  
  
  
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
      var token = jwt.sign({newuser} , "tempprivatekey" , { expiresIn: "1h" });
      res.status(200).json({msg :  "User has been successfully added" , token , newuser})
  
    }
    }); 
})



module.exports = router;