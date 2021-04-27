var express = require('express');
var router = express.Router();

var nodemailer = require("nodemailer");
var { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
var randomstring = require("randomstring");
var flash = require('connect-flash');
var User =  require("../Schema/User");
var database = require("../Schema/dbconnect.js");
var session = require('express-session');
var Email = require('../email');

router.use(flash());



/**
 * @swagger
 * /authenticate/sendemail:
 *  put:
 *    description: Authenticate an email by sending a randomly generated passcode to user email.
 *              
 *    responses:
 *      '200':
 *        description: Passcode has been sent
 *      '400':
 *        description: Email does not exist
 */
router.put('/sendemail' ,async (req,res) =>{
  if(req.session.loggedIn === true)
  {
    if(await User.exists({ _id: req.session.user._id}))
    {
        var passcode = randomstring.generate(8);
        req.flash('passcode', `${passcode}`);
        Email.autoEmail(req.session.user.email , passcode);
        
        
        res.status(200).send("Email Sent")
    }
    else
    {
        return res.status(400).send("Email does not exist in database")
    }
  }
  else{
    res.status(400).send("User is not logged in")
  }
});




/**
 * @swagger
 * /authenticate/passcode:
 *  put:
 *    description: Take passcode from user and confirm it is correct.
 *    parameters:
 *     - in: body
 *       name: Passcode
 *       schema:
 *         type: object
 *         required:
 *          - passcode
 *         properties:
 *           passcode: 
 *             type: string
 *              
 *    responses:
 *      '200':
 *        description: Passcode matches
 *      '400':
 *        description: Passcode does not match
 */
 router.put('/passcode', async (req,res) =>{
    
    if(req.flash('passcode')[0] === req.body.passcode)
    {
        var emailtaken = req.session.user.email;
        await User.findOneAndUpdate({email: emailtaken}, {isAuthen : true});
        console.log(emailtaken)
        res.status(200).send("User Email has been authenticated")
    }
    else{
        res.status(400).send("Passcode is wrong")
    }
   
});




module.exports = router;
