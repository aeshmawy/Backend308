var express = require('express');
var router = express.Router();

const multer = require('multer')
var fs = require('fs');
var Comment = require('../Schema/Comment');
var Invoice = require('../Schema/Invoice');
var Product = require('../Schema/Products');
var Refunds = require('../Schema/Refunds');
var validator = require('validator');
var bcrypt = require('bcrypt');
var User =  require("../Schema/User");
var PDF =  require("../Schema/PDF");
var database = require("../Schema/dbconnect.js");
var noImgPath = 'logo.jpg';
var ObjectId = require('mongoose').Types.ObjectId; 


router.use(async (req,res,next) =>{
    if(req.session.loggedIn)
    {
        if(req.session.user.userType === 4 || req.session.user.userType === 2)
        {
            next()
        }
        else
        {
            return res.status(403).send("User does not have sufficient permission. Please log in as admin or PM")
        }
    }
    else
    {
        return res.status(403).send("User is not logged in")
    }
})

/**
 * @swagger
 * /sm/dates:
 *   post:
 *    description: Give a json file containing a username and password. 
 *    tags: 
 *      - SM
 *    parameters:
 *       - in : body
 *         name : dates
 *         schema: 
 *          type: object
 *          properties:
 *            startdateday:
 *              type: number
 *            startdatemonth:
 *              type: number
 *            startdateyear:
 *              type: number
 *            enddateday:
 *              type: number
 *            enddatemonth:
 *              type: number
 *            enddateyear:
 *              type: number
 *       
 *    responses:
 *      '200':
 *        description: A successful Login
 *      '404': 
 *        description: Username does not exist in database
 *      '400':
 *        description: Username exists but the password is wrong
 *      '500':
 *        description: Something has gone terribly wrong.
 */
router.post('/dates', async (req, res) =>{
    if(req.body.startdateday && req.body.startdatemonth && req.body.startdateyear 
        && req.body.enddateday && req.body.enddatemonth && req.body.enddateyear ){
        var beginning = new Date(req.body.startdateyear, req.body.startdatemonth - 1, req.body.startdateday);
        var end = new Date(req.body.enddateyear, req.body.enddatemonth - 1, req.body.enddateday);
        end.setDate(end.getDate() + 1);
        var easyArr = []
        var invoices = await Invoice.find({date: {$gte: beginning,$lt: end }})
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
            if(invoices[i].items.length === 0)
            {
                refunds = await Refunds.find({invoiceID : invoices[i]._id}).populate("productID");
                if(refunds !== []){
                var element1 = refunds[0].toObject();
                element1.productID.quantity = refunds[0].quantity
                element1.productID.PriceatPurchase = refunds[0].PriceatPurchase
                //console.log(refunds[0].quantity)
                //console.log(element.productID)
                products.push(element1.productID)
                }
            }
            element.items = []
            element.products = products 
            
            easyArr.push(element)
        }
        res.status(200).send(easyArr)
    }
    else
    {
        res.status(400).send("Some variable is not defined in the body")
    }

})
/**
 * @swagger
 * /sm/{invoiceid}/pdf:
 *    get:
 *       description: get pdf of an invoice
 *       tags:
 *       - SM
 *       produces:
 *       - application/pdf
 *       parameters:
 *       - in : path
 *         name: invoiceid
 *         required: true
 *         type: string
 *       responses:
 *         200:
 *           description: A successful product image get
 *          
 */
router.get('/:invoiceid/pdf',async  (req, res) => 
{
    console.log(req.params.invoiceid)
    var wantedpdf = await PDF.find({invoiceID: req.params.invoiceid})
   

    res.set('Content-Type', 'application/pdf');
    
    res.set('content-disposition', `attachment; filename="invoice${req.params.invoiceid}"`);
    res.status(200).send(wantedpdf[0].invoicePDF);
})

module.exports = router;