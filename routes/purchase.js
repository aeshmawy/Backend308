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
    var totalDCprice = 0;
    founduser = await User.findById(req.session.user._id).populate("userCart.Product");
    for(var i = 0; i < founduser.userCart.length;i++)
    {
        founduser.userCart[i].Product.quantity = founduser.userCart[i].Quantity;
        totalprice += (founduser.userCart[i].Product.productPrice * founduser.userCart[i].Quantity )
        totalDCprice += (founduser.userCart[i].Product.productDCPrice * founduser.userCart[i].Quantity )
    }
    req.session.totalprice = totalDCprice;
    req.session.totalDCprice = totalDCprice
    res.status(200).json({totalprice: parseFloat(totalprice).toFixed(2),totalDCprice: parseFloat(totalDCprice).toFixed(2)});
    }   
    else if(req.session.userCart)
    {   var totalprice = 0;
        var totalDCprice = 0;
        for(var i = 0; i < req.session.userCart.length;i++)
        {
            req.session.userCart[i].Product.quantity = req.session.userCart[i].Quantity;
            totalprice += (req.session.userCart[i].Product.productPrice * req.session.userCart[i].Quantity )
            totalDCprice += (req.session.userCart[i].Product.productDCPrice * req.session.userCart[i].Quantity )
        }
        req.session.totalprice = totalDCprice;
        req.session.totalDCprice = totalDCprice;
        res.status(200).json({totalprice: parseFloat(totalprice).toFixed(2),totalDCprice: parseFloat(totalDCprice).toFixed(2)});
    }
    else
    {
        res.status(200).json({totalprice: 0,totalDCprice: 0});
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
            totalprice: req.session.totalDCprice,
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
 *  get:
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
router.get('/sendinvoice' , async (req,res) =>
{
    var now = new  Date();
    var details = new Object({
        fullName: req.session.details.fullName,
        BaddressCountry: req.session.details.BaddressCountry,
        BaddressCity: req.session.details.BaddressCity,
        BaddressStreet: req.session.details.BaddressStreet,
        SaddressCountry: req.session.details.SaddressCountry,
        SaddressCity: req.session.details.SaddressCity,
        SaddressStreet: req.session.details.SaddressStreet,
        zipCode : req.session.details.zipCode,
        date : Date(),
        dateString: now.toISOString()
    });
    var something = await User.findById(req.session.user._id).select("userCart -_id")

    console.log("here1: " + something.userCart)
    if(something.userCart !== [])
    {var invoiceid = await Email.autoInvoice(req.session.details, something.userCart, req.session.user.email);
    founduser = await User.findById(req.session.user._id)
    for(var i = 0; i < founduser.userCart.length; i++)
    {
        if(!founduser.purchasedProducts.includes(founduser.userCart[i].Product._id))//if it doesnt include the prodct
        founduser.purchasedProducts.push(founduser.userCart[i].Product._id)//push the product id
    }
    founduser.userCart = [];
    await founduser.save();
    details.invoiceid = invoiceid;
    res.status(200).send(details);}
    else{
        res.status(400).send("Cart is empty");
    }
})


/**
 * @swagger
 * /purchase:
 *  get:
 *    description: get all purchases of the logged in user
 *    tags:
 *      - order    
 *    responses:
 *      '200':
 *        description: Successful Registration(User has been added to the database)
 *      '400':
 *        description: Username or password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */

router.get('/', async (req,res) =>{

    if(req.session.loggedIn === true)
    {
        invoices = await Invoice.find({userEmail: req.session.user.email}).populate("items.Product").sort({"date": -1});
        var easyArr = []
        var products = []
        var element = new Object();
        for(var i = 0; i < invoices.length; i++)
        {
            var products = []
            element = invoices[i].toObject()
            for(var j = 0; j < invoices[i].items.length; j++)
            {
                if(element.items[j].Product === undefined){break;}
                element.items[j].Product.quantity =  invoices[i].items[j].Quantity
                element.items[j].Product.PriceatPurchase =  invoices[i].items[j].PriceatPurchase
                products.push(element.items[j].Product)
            }
            element.items = []
            element.products = products 
            
            easyArr.push(element)
        }
        res.status(200).send(easyArr)
    }
    else
    {
        res.status(400).send("User is not logged in ")
    }
})

/**
 * @swagger
 * /purchase/{id}:
 *  get:
 *    description: get all purchases of the logged in user
 *    tags:
 *      - order  
 *    parameters:
 *      - in : path
 *        name : id
 *        type: string
 *        required : true  
 *    responses:
 *      '200':
 *        description: Successful Registration(User has been added to the database)
 *      '400':
 *        description: Username or password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */
router.get('/:id', async (req,res) =>{

    print(req.session.loggedIn  )
    if(req.session.loggedIn === true)
    {
        invoices = await Invoice.findById(req.params.id).populate("items.Product");
    
        var easyArr = []
        var products = []
        var element = new Object();
        for(var i = 0; i < 1; i++)
        {
            var products = []
            element = invoices.toObject()
            for(var j = 0; j < invoices.items.length; j++)
            {
                if(element.items[j].Product === undefined){break;}
                element.items[j].Product.quantity =  invoices.items[j].Quantity
                element.items[j].Product.PriceatPurchase =  invoices.items[j].PriceatPurchase
                products.push(element.items[j].Product)
            }
            element.items = []
            element.products = products 
            
            easyArr.push(element)
        }
        res.status(200).send(easyArr)
    }
    else
    {
        res.status(400).send("User is not logged in ")
    }
})

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
