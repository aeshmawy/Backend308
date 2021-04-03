const multer = require('multer')
const express = require('express');
const Product = require('../Schema/Products');
var fs = require('fs');
var router = express.Router();

var noImgPath = 'C:\\Users\\ahmed\\Desktop\\CS308 Backend\\images\\noImage.png';

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





/**
 * @swagger
 * /product/add:
 *    post:
 *       description: TODO=> take token from user and check if usertype is 3(PM)
 *       tags:
 *       - product   
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
 router.post('/add', 
 async (req, res) => 
 {
     var newProduct = new Product(); 
     console.log(req.body);
     
     newProduct.productImage = fs.readFileSync(noImgPath);

     if(req.body.productName)
     {newProduct.productName = req.body.productName;}
 
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
 
     
 }
 )




/**
 * @swagger
 * /product/setimage/{id}:
 *    put:
 *       description: TODO=> take token from user and check if usertype is 3(PM)
 *       tags:
 *       - product   
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
 * /product/{id}/allinfo:
 *    get:
 *       description: get image of a product
 *       tags:
 *       - product
 *       parameters:
 *       - in : path
 *         name: id
 *         required: true
 *         type: string
 *       responses:
 *         200:
 *           description: A successful product get
 */

 router.get('/:id/allinfo',
 async (req, res) => 
 {
     var wantedProduct = await Product.findById(req.params.id, {productImage: 0}).exec();
 
     if(!wantedProduct)
     {
         return res.status(400).send("Product with id: " + req.params.id + " does not exist");
     }
     else{
         console.log("I am here")
         return res.status(200).json(wantedProduct);
     }
 }
 )

/**
 * @swagger
 * /product/{id}/image:
 *    get:
 *       description: get image of a product
 *       tags:
 *       - product
 *       produces:
 *       - image/png
 *       - image/jpeg
 *       parameters:
 *       - in : path
 *         name: id
 *         required: true
 *         type: string
 *       responses:
 *         200:
 *           description: A successful product image get
 *           schema:
 *           type: file
 */
router.get('/:id/image', upload.single('upload'), 
async (req, res) => 
{
    var wantedProduct = await Product.findById(req.params.id)

    if(!wantedProduct)
    {return res.status(400).send("Product with id: " + req.params.id + " does not exist");}
    else{
        res.set('Content-Type', 'image/png');
        res.status(200).send(wantedProduct.productImage);
        
    }
}
)

module.exports = router;