var express = require('express');
var router = express.Router();

const multer = require('multer')
var fs = require('fs');
const Product = require('../Schema/Products');
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





module.exports = router;
