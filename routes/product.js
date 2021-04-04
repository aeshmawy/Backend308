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
     //console.log(req.body);
     
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
 * /product/all:
 *   get:
 *    description: Returns a query according to the search term. (searchs all strings of the schema) 
 *    tags: 
 *      - product
 *    responses:
 *      200:
 *        description: A successful search
 */


 router.get('/all', async (req,res) => {
    
    var SearchedProducts = await Product.find( {} , {productImage: 0})
    
    res.status(200).send(SearchedProducts);

})


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
         //console.log("I am here")
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
router.get('/:id/image',
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

/**
 * @swagger
 * /product/{category}:
 *    get:
 *       description: get all products of a certain category
 *       tags:
 *       - product
 *       parameters:
 *       - in : path
 *         name: category
 *         required: true
 *         type: string
 *       responses:
 *         200:
 *           description: A successful get
 */

router.get('/:category',
async (req,res) =>
{
    var ProductsSearched = await Product.find({productCategory: req.params.category},{productImage: 0})
    res.status(200).send(ProductsSearched);
})


/**
 * @swagger
 * /product/price/{order}:
 *    get:
 *       description: sort products accoring to price
 *       tags:
 *       - product
 *       parameters:
 *       - in : path
 *         name: order
 *         required: true
 *         type: string
 *         description: takes ascending and descending as input
 *       responses:
 *         200:
 *           description: A successful get
 */


router.get('/price/:order', //order can be ascending , order can be descending
async (req,res) =>
{
    if(req.params.order === "ascending")
    var ProductsSearched = await Product.find({},{productImage: 0}).sort({productPrice: 1})
    else if(req.params.order === "descending")
    var ProductsSearched = await Product.find({},{productImage: 0}).sort({productPrice: -1}) 
    else
    return res.status(400).send("Please give a correct input")
    return res.status(200).send(ProductsSearched);
})


/**
 * @swagger
 * /product/popular/{order}:
 *    get:
 *       description: sort products accoring to price
 *       tags:
 *       - product
 *       parameters:
 *       - in : path
 *         name: order
 *         required: true
 *         type: string
 *         description: takes rating and numrating as input
 *       responses:
 *         200:
 *           description: A successful get
 */


 router.get('/popular/:order', //order can be rating , order can be numrating
 async (req,res) =>
 {
     if(req.params.order === "rating")
     var ProductsSearched = await Product.find({},{productImage: 0}).sort({productRating: -1 , productNumofRatings: -1})
     else if(req.params.order === "numrating")
     var ProductsSearched = await Product.find({},{productImage: 0}).sort({productNumofRatings: -1 , productRating: -1}) 
     else
     return res.status(400).send("Please give a correct input")
     return res.status(200).send(ProductsSearched);
 })

 /**
 * @swagger
 * /product/search/{searchString}:
 *   get:
 *    description: Returns a query according to the search term. (searchs all strings of the schema) 
 *    tags: 
 *    - product
 *    parameters:
 *       - in : path
 *         name : searchString
 *         type: string
 *         default: ""
 *    responses:
 *      200:
 *        description: A successful search
 */


router.get('/search/:searchString', async (req,res) => {
    console.log("here" + req.params.searchString);
    if(req.params.searchString === " ")
    {var SearchedProducts = await Product.find( {} , {productImage: 0})}
    else{var SearchedProducts = await Product.find({$text: {$search: req.params.searchString}} , {productImage: 0})}
    res.status(200).send(SearchedProducts);

})

module.exports = router;