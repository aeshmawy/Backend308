var express = require('express');
var router = express.Router();

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
 *             type: object
 *             properties:
 *                isSM: 
 *                  type: boolean
 *                  default: "false"
 *                isPM:
 *                  type: boolean
 *                  default: false
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
  
  console.log("123");
  var newuser = new User();
  newuser.username = req.body.username;
  
  console.log(req.body.userType);
  
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
      res.status(500).send("Wrong information")
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