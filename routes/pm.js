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
var database = require("../Schema/dbconnect.js");
var noImgPath = 'logo.jpg';

/* GET home page. */
const upload = multer(
{
    //dest: 'images',

    fileFilter(req, file, cb) 
    {
        if (!file.originalname.endsWith("jpg") && !file.originalname.endsWith("png") && !file.originalname.endsWith("jpeg"))
        {
            cb(null, false)
        }
        else
        {
            cb(null, true)
        }
        
    }
}
)

router.use(async (req,res,next) =>{
    if(req.session.loggedIn)
    {
        if(req.session.user.userType === 4 || req.session.user.userType === 3)
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
 * /pm/addproduct:
 *    post:
 *       description: TODO=> take token from user and check if usertype is 3(PM)
 *       tags:
 *       - PM  
 *       parameters:
 *       - in : body
 *         name : Productinfo
 *         schema: 
 *           type: object
 *           properties:
 *             productSize:
 *               type: string
 *             productName:
 *               type: string
 *             productDistributor:
 *               type: string
 *               default: "Some Art Company"
 *             productDescription:
 *               type: string
 *               default: "This is a product!"
 *             productCategory:
 *               type: string
 *               default: "Brush"
 *             productBGcolor:
 *               type: string
 *               default : "Peach"
 *             productPrice: 
 *               type: number
 *             productDiscount:
 *               type: number
 *             productStock: 
 *               type: number
 *             productBestseller: 
 *               type: boolean
 *               default: false
 *             productRating: 
 *               type: number
 *             productNumofRatings: 
 *               type: number
 *       responses:
 *          200:
 *            description: A successful Login
 */

router.post('/addproduct', async (req, res) =>{
    var newProduct = new Product(); 
     //console.log(req.body);
     
     newProduct.productImage = fs.readFileSync(noImgPath);

     if(req.body.productName)
     {newProduct.productName = req.body.productName;}
     
     if(req.body.productBGcolor)
     {newProduct.productBGcolor = req.body.productBGcolor;}

     if(req.body.productCategory)
     {newProduct.productCategory = req.body.productCategory;}

     if(req.body.productSize)
     {newProduct.productSize = req.body.productSize;}
 
     if(req.body.productDistributor)
     {newProduct.productDistributor = req.body.productDistributor;}
     
     if(req.body.productDescription)
     {newProduct.productDescription = req.body.productDescription;}
 
     if(req.body.productPrice)
     {newProduct.productPrice = req.body.productPrice;}
 
     if(req.body.productDiscount)
     {newProduct.productDiscount = req.body.productDiscount;}
 
     if(req.body.productStock)
     {newProduct.productStock = req.body.productStock;}
 
     if(req.body.productDescription)
     {newProduct.productDescription = req.body.productDescription;}

     if(req.body.productBestseller)
     {newProduct.productBestseller = req.body.productBestseller;}
     
     if(req.body.productRating)
     {newProduct.productRating = req.body.productRating;}

     if(req.body.productNumofRatings)
     {newProduct.productNumofRatings = req.body.productNumofRatings;}

     newProduct.productFlutterLink = `http://10.0.2.2:5000/product/image/${newProduct._id}`  
     newProduct.productImageLink = `http://localhost:5000/product/image/${newProduct._id}`  
     newProduct.onlineImageLink = `https://cs308canvas.herokuapp.com/product/image/${newProduct._id}`
     newProduct.productDCPrice = newProduct.productPrice - (newProduct.productPrice * (newProduct.productDiscount/100))
     //console.log(newProduct);
     newProduct.save((err, savedProduct) =>
     {
         if(err)
       { 
         console.log(err);
         res.status(500).send("Error.")
       }
       else
       {
         
         res.status(200).json({msg: "Product has been added to the database.", productid: newProduct._id})
     
       }
     })
});

/**
 * @swagger
 * /pm/setimage/{id}:
 *    put:
 *       description: change image of a product
 *       tags:
 *       - PM   
 *       consumes:
 *       - multipart/form-data
 *       parameters:
 *       - in : formData
 *         name: upload
 *         type: file
 *       - in : path
 *         name: id
 *         required: true
 *         type: string
 *       responses:
 *          200:
 *            description: A successful Login
 */

 router.put('/setimage/:id', upload.single('upload'), 
 async (req, res) => 
 {
     
     if(req.file)
     {
         await Product.findByIdAndUpdate(req.params.id, {productImage: req.file.buffer});
         res.status(200).send("Image has been successfuly update")
     }
     else
     {
         res.status(400).send("Please insert an image.")
     }
 
 }
 )
 
/**
 * @swagger
 * /pm/deleteproduct/{id}:
 *   delete:
 *     description: delete one product from the database
 *     tags:
 *      - PM
 *     parameters:
 *      - in : path
 *        name : id
 *        type: string
 *        required : true  
 *     responses:
 *        '200':
 *          description: Successful Product deletion
 *       
 */

router.delete('/deleteproduct/:id', async (req, res) =>{
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) 
    {
        Product.findByIdAndUpdate(req.params.id,{"isDeleted": true} ,(err,found) =>{
        if(err)
        {return res.status(400).send("There was some issue");}
        else{
            return  res.status(200).send("Product successfully deleted");
        }
        });
        
    }
    else
    {
        return res.status(400).send("Product id is not valid");
    }

});

/**
 * @swagger
 * /pm/productstock/{id}/{quantity}:
 *   put:
 *     description: delete one product from the database
 *     tags:
 *      - PM
 *     parameters:
 *      - in : path
 *        name : id
 *        type: string
 *        required : true 
 *      - in : path
 *        name : quantity
 *        type: number
 *        required : true   
 *     responses:
 *        '200':
 *          description: Successful Product deletion
 *       
 */
router.put('/productstock/:id/:quantity', async (req, res) =>{
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) 
    {
        await Product.findByIdAndUpdate(req.params.id, {productStock: parseInt(req.params.quantity)})
        res.status(200).send("Stock has been adjsuted")
    }
    else
    {
        return res.status(400).send("Product id is not valid");
    }
});

/**
 * @swagger
 * /pm/approvecomment/{commentid}:
 *   put:
 *     description: approva a comment
 *     tags:
 *      - PM
 *     parameters:
 *      - in : path
 *        name : commentid
 *        type: string
 *        required : true 
 *     responses:
 *        '200':
 *          description: Successful comment approval
 *       
 */
router.put('/approvecomment/:commentid', async (req, res) =>{
    if (req.params.commentid.match(/^[0-9a-fA-F]{24}$/)) 
    {
        await Comment.findByIdAndUpdate(req.params.commentid, {approved: true})
        res.status(200).send("Comment has been approved")
    }
    else
    {
        return res.status(400).send("comment id is not valid");
    }
});

/**
 * @swagger
 * /pm/denycomment/{commentid}:
 *   put:
 *     description: deny a comment
 *     tags:
 *      - PM
 *     parameters:
 *      - in : path
 *        name : commentid
 *        type: string
 *        required : true 
 *     responses:
 *        '200':
 *          description: Successful comment approval
 *       
 */
 router.put('/denycomment/:commentid', async (req, res) =>{
    if (req.params.commentid.match(/^[0-9a-fA-F]{24}$/)) 
    {
        await Comment.findByIdAndDelete(req.params.commentid)
        res.status(200).send("Comment has been deleted")
    }
    else
    {
        return res.status(400).send("comment id is not valid");
    }
});


/**
 * @swagger
 * /pm/allinvoices:
 *   get:
 *    description: get all invoices
 *    tags: 
 *    - PM
 *    responses:
 *      200:
 *        description: A successful search
 */
router.get('/allinvoices', async (req, res) =>{

    invoices = await Invoice.find({}).populate("items.Product").sort({"date": -1});
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
        if(invoices[i].items.length === 0)
        {
            refunds = await Refunds.find({invoiceID : invoices[i]._id}).populate("productID");
            if(refunds !== []){
            var element1 = refunds[0].toObject();
            element1.productID.quantity = refunds[0].quantity
            element1.productID.PriceatPurchase = refunds[0].PriceatPurchase
            console.log(refunds[0].quantity)
            //console.log(element.productID)
            products.push(element1.productID)
            }
        }
        element.items = []
        element.products = products 
        
        easyArr.push(element)
    }
    res.status(200).send(easyArr)

});

/**
 * @swagger
 * /pm/invoices/{invoiceid}:
 *  get:
 *    description: get one purchase of the logged in user
 *    tags:
 *      - PM  
 *    parameters:
 *      - in : path
 *        name : invoiceid
 *        type: string
 *        required : true  
 *    responses:
 *      '200':
 *        description: get one invoice details for pm
 *      
 */
 router.get('/invoices/:invoiceid', async (req, res) =>{

    invoices = await Invoice.findById(req.params.invoiceid).populate("items.Product");
    
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
            element.items[j].Product.refundquantity = 0;
            var refunds = await Refunds.find({invoiceID: req.params.id, productID: invoices.items[j].Product._id});
            for(var k = 0; k < refunds.length; k++)
            {
                element.items[j].Product.refundquantity += refunds[k].quantity
            }
            element.items[j].Product.quantity =  invoices.items[j].Quantity
            element.items[j].Product.PriceatPurchase =  invoices.items[j].PriceatPurchase
            products.push(element.items[j].Product)
        }
        element.items = []
        element.products = products 
        
        easyArr.push(element)
    }
    res.status(200).send(easyArr)

});

/**
 * @swagger
 * /pm/invoices/{invoiceid}/{invoicestatus}:
 *  put:
 *    description: change status of a delivery. processing , in-transit or delivered
 *    tags:
 *      - PM  
 *    parameters:
 *      - in : path
 *        name : invoiceid
 *        type: string
 *        required : true
 *      - in : path
 *        name : invoicestatus
 *        type: string
 *        required : true
 *    responses:
 *      '200':
 *        description: update status of one invoice
 *      
 */
 router.put('/invoices/:invoiceid/:invoicestatus', async (req, res) =>{

    if(req.params.invoicestatus === "processing"
        ||req.params.invoicestatus === "in-transit"
        ||req.params.invoicestatus === "delivered")
    {
        invoices = await Invoice.findByIdAndUpdate(req.params.invoiceid, {status: req.params.invoicestatus});
        res.status(200).send("Update successful")
    }
    res.status(400).send("Please enter a valid status")
    
    
});
module.exports = router;
