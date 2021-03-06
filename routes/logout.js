var express = require('express');
var router = express.Router();




/**
 * @swagger
 * /logout:
 *   post:
 *    description: Give a json file containing a username and password. 
 *    tags: 
 *      - log
 *    responses:
 *      '200':
 *        description: A successful log out
 *      '400': 
 *        description: log out failed
 */
 router.post('/', async (req,res) => {
    //console.log("I am here")
    if(req.session.loggedIn === true)
    {
      console.log("I am here")
      console.log(req.session.user)
      req.session.destroy();
      
      res.status(200).send("Successful Log out")
    }
    else
    {
      res.status(400).send("User is not logged  in")
    }
});

module.exports = router;