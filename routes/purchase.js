var express = require('express');
var router = express.Router();
var Email = require('../email');
const Invoice = require('../Schema/Invoice');
var User = require('../Schema/User')
/**
 * @swagger
 * /purchase/totalprice:
 *   get:
 *    description: return totalprice as a string.
 *    tags: 
 *      - order
 *    responses:
 *      '200':
 *        description: A successful get
 * 
 */
router.get('/totalprice', async (req,res) =>
{   if(req.session.loggedIn === true)
    {var totalprice = 0;
    founduser = await User.findById(req.session.user._id).populate("userCart.Product");
    for(var i = 0; i < founduser.userCart.length;i++)
    {
        founduser.userCart[i].Product.quantity = founduser.userCart[i].Quantity;
        totalprice += (founduser.userCart[i].Product.productPrice * founduser.userCart[i].Quantity )
    }
    
    res.status(200).send(parseFloat(totalprice).toFixed(2));
    }   
    else if(req.session.userCart)
    {   var totalprice = 0;
        for(var i = 0; i < req.session.userCart.length;i++)
        {
            req.session.userCart[i].Product.quantity = req.session.userCart[i].Quantity;
            totalprice += (req.session.userCart[i].Product.productPrice * req.session.userCart[i].Quantity )
        }
        res.status(200).send(parseFloat(totalprice).toFixed(2));
    }
    
    
});

/**
 * @swagger
 * /purchase/step1:
 *  post:
 *    description: Take purchase details
 *    tags:
 *      - order
 *      - test
 *    parameters:
 *     - in: body
 *       name: Details
 *       schema:
 *         type: object
 *         required:
 *          - fullName
 *          - BaddressCountry
 *          - BaddressCity
 *          - BaddressStreet
 *          - SaddressCountry
 *          - SaddressCity
 *          - SaddressCity
 *         properties:
 *           fullName: 
 *             type: string
 *             default: Ahmed Eshmawy
 *           BaddressCountry:
 *             type: string
 *           BaddressCity:
 *             type: string
 *           BaddressStreet:
 *             type: string
 *           SaddressCountry:
 *             type: string
 *             default: Turkey
 *           SaddressCity:
 *             type: string
 *             default: Istanbul
 *           SaddressStreet:
 *             type: string
 *             default: Cool Street 1000
 *              
 *    responses:
 *      '200':
 *        description: Successful Registration(User has been added to the database)
 *      '400':
 *        description: Username or password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */

router.post('/step1', async (req,res) =>
{
    if(req.session.loggedIn === true)
    {
        var details = new Object({
            fullName: req.body.fullName,
            BaddressCountry: req.body.BaddressCountry,
            BaddressCity: req.body.BaddressCity,
            BaddressStreet: req.body.BaddressStreet,
            SaddressCountry: req.body.SaddressCountry,
            SaddressCity: req.body.SaddressCity,
            SaddressStreet: req.body.SaddressStreet,
            zipCode : req.body.zipCode,
            totalprice: req.session.totalprice
        });
        req.session.details = details;
        res.status(200).send("details saved");
    }
    else
    {
        res.status(403).send("User is not logged in.")
    }
    
    //TODO: tak
})

/**
 * @swagger
 * /purchase/step2:
 *  post:
 *    description: Take purchase details
 *    tags:
 *      - order
 *    parameters:
 *     - in: body
 *       name: Details
 *       schema:
 *         type: object
 *         required:
 *          - CardNumber
 *          - Date
 *          - PIN
 *          - CardName
 *         properties:
 *           CardNumber: 
 *             type: string
 *           Date:
 *             type: string
 *           PIN:
 *             type: string
 *           CardName:
 *             type: string
 *              
 *    responses:
 *      '200':
 *        description: Successful Registration(User has been added to the database)
 *      '400':
 *        description: Username or password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */
router.post('/step2', async (req,res) =>
{
    if(req.session.loggedIn === true)
    {
        //Validatin credit card not within course content. so do nothing
        res.status(200).send("Card details saved");
    }
    else
    {
        res.status(403).send("User is not logged in.")
    }
})

/**
 * @swagger
 * /purchase/sendinvoice:
 *  post:
 *    description: Send invoice
 *    tags:
 *      - order    
 *      - test    
 *    responses:
 *      '200':
 *        description: Successful Registration(User has been added to the database)
 *      '400':
 *        description: Username or password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */
router.post('/sendinvoice' , async (req,res) =>
{
    var details = new Object({
        fullName: req.session.details.fullName,
        BaddressCountry: req.session.details.BaddressCountry,
        BaddressCity: req.session.details.BaddressCity,
        BaddressStreet: req.session.details.BaddressStreet,
        SaddressCountry: req.session.details.SaddressCountry,
        SaddressCity: req.session.details.SaddressCity,
        SaddressStreet: req.session.details.SaddressStreet,
        zipCode : req.session.details.zipCode,
        date : Date.now(),
    });

   
    Email.autoInvoice(req.session.details, req.session.user.userCart, req.session.user.email);
    founduser = await User.findById(req.session.user._id)
    for(var i = 0; i < founduser.userCart.length; i++)
    {
        if(!founduser.purchasedProducts.includes(founduser.userCart[i].Product._id))//if it doesnt include the prodct
        founduser.purchasedProducts.push(founduser.userCart[i].Product._id)//push the product id
    }
    founduser.userCart = [];
    founduser.save();
    res.status(200).send(details);
})



router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
