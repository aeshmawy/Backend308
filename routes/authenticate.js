var express = require('express');
var router = express.Router();

var nodemailer = require("nodemailer");
var { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
var randomstring = require("randomstring");
var flash = require('connect-flash');
var User =  require("../Schema/User");
var database = require("../Schema/dbconnect.js");
var session = require('express-session')

router.use(flash());

const oauth2Client = new OAuth2(
  "293929424947-o6b6m9pt6go7sst01b6gc5pl6o28bglr.apps.googleusercontent.com", // ClientID
  "jXSYqCjbxG87cML8KYGPqe2i", // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
  refresh_token: "1//04xcIBmuenaVnCgYIARAAGAQSNwF-L9IrSHb0U4vo8hqpAPeHy-VXcnIis9NmGYz-Jw6yOPzmwWdM8eWvQdkvekO_VeSgvFxDsH4"
});
const accessToken = oauth2Client.getAccessToken();

async function autoEmail(email , passcode) {
    //Email we are sending from. Do not change transporter values.
    
    let transporter = nodemailer.createTransport({
     service: "Gmail",
     auth: {
      type: "OAuth2",
      user: "feelsbadneed@gmail.com", 
      clientId: "293929424947-o6b6m9pt6go7sst01b6gc5pl6o28bglr.apps.googleusercontent.com",
      clientSecret: "jXSYqCjbxG87cML8KYGPqe2i",
      refreshToken: "1//04xcIBmuenaVnCgYIARAAGAQSNwF-L9IrSHb0U4vo8hqpAPeHy-VXcnIis9NmGYz-Jw6yOPzmwWdM8eWvQdkvekO_VeSgvFxDsH4",
      accessToken: accessToken
    },
    tls: {
      rejectUnauthorized: false
    }
   });
   
   let info = await transporter.sendMail({
     from: 'CS308 Team 17 <noreply@cs308.com>', // sender address
     to: email, // list of receivers
     subject: "Please Authenticate your email", // Subject line
     
     html: `<b>${passcode}</b>`, // html body
   });
   //console.log("Message sent: %s", info.messageId);
  }

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
        req.flash('email', `${req.body.email}`);
        autoEmail(req.session.user.email , passcode);
        
        
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
        var emailtaken = req.flash('email');
        await User.findOneAndUpdate({email: emailtaken}, {isAuthen : true});
        
        res.status(200).send("User Email has been authenticated")
    }
    else{
        res.status(400).send("Passcode is wrong")
    }
   
});




module.exports = router;
