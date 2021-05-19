var express = require('express');
var router = express.Router();

var validator = require('validator');
var bcrypt = require('bcrypt');
var User =  require("../Schema/User");
var database = require("../Schema/dbconnect.js");


/* GET home page. */
router.use(async (req,res,next) =>{
    
    if(req.session.user.userType === 4)
    {
        next()
    }
    else
    {
        return res.status(403).send("User does not have sufficient permission. Please log in as admin.")
    }
})
/**
 * @swagger
 * /admin/createaccount:
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
 *              
 *    responses:
 *      '200':
 *        description: Successful Registration(User has been added to the database)
 *      '400':
 *        description: Username or password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */

router.post('/createaccount', async (req, res) =>{
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
    
    
    
    if(req.body.userType)//TODO: restrict this
    {newuser.userType = req.body.userType;}
  
    if(req.body.password)
    {
      newuser.password = await bcrypt.hash(req.body.password, 10); 
    }
    else {return res.status(400).send("Please insert a password.");}
    
    
     await newuser.save((err, Saveduser) => {
  
      if(err)
      { 
        //console.log(err);
        res.status(500).send("Something went wrong")
      }
      else
      {
        var userinfo = newuser;
        req.session.loggedIn = true;
        userinfo.password = null;
        req.session.user = userinfo;
        
        res.status(200).send("User has been successfully created")
    
      }
      }); 
});






module.exports = router;
