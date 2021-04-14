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
 router.post('/add', 
 async (req, res) => 
 {
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

     newProduct.productImageLink = `http://localhost:5000/product/image/${newProduct._id}`  
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
 * /product/allinfo/{id}:
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

 router.get('/allinfo/:id',
 async (req, res) => 
 {  
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) 
    {
       var  wantedProduct = 
       await Product.findById(req.params.id, {productImage: 0}
       ,(err, wantedProduct) => 
       {
            if(err){return null}
            else{return wantedProduct}
       }).populate("productComments");
       
       console.log(wantedProduct);
    }
    else{wantedProduct = null;}
 
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
 * /product/image/{id}:
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
router.get('/image/:id',
async (req, res) => 
{
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) 
    {
       var  wantedProduct = 
       await Product.findById(req.params.id
       ,(err, wantedProduct) => 
       {
            if(err){return null}
            else{return wantedProduct}
       });
    }
    else{wantedProduct = null;}

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
 * /product/category/{category}:
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

router.get('/category/:category',
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

/**
 * @swagger
 * /product/filter:
 *   get:
 *    description: Returns a query according to the search term. (searchs all strings of the schema) 
 *    tags: 
 *    - productFilter
 *    parameters:
 *       - in : query
 *         name : categories
 *         type: array
 *         items:
 *           type: string
 *       - in : query
 *         name : order
 *         type: string
 *       - in : query
 *         name: brands
 *         type: array
 *         items:
 *           type: string
 *       - in : query
 *         name : searchString
 *         type: string
 *    responses:
 *      200:
 *        description: A successful search
 */


router.get('/filter' , async (req,res) =>{
    if(req.query.categories)
    {var categories = req.query.categories.split(",");}
    else
    {var categories = ["Brush" , "Canvas" , "Paint", "Painting", "Acessory","Spray"]}

    if(req.query.brands)
    {var brands = req.query.brands.split(",")}
    else
    {
    var brands = await Product.find({} , {productImage : 0})
    .distinct('productDistributor', 
    (error, brand) => 
    {
       // brand is an array of all unique department names
       
       return brand;
    })
    }
    
    
    
    try{
    if(req.query.order === "ratings")
    {var ProductsSearched = await Product.find({productCategory: {$in: categories}, productDistributor : {$in: brands}},{productImage: 0})
    .sort({productRating: -1 , productNumofRatings: -1})}
    else if(req.query.order === "popular")
    {var ProductsSearched = await Product.find({productCategory: {$in: categories}, productDistributor : {$in: brands}},{productImage: 0})
    .sort({productNumofRatings: -1 , productRating: -1}) }
    else if (req.query.order === "ascending")
    {var ProductsSearched = await Product.find({productCategory: {$in: categories} , productDistributor : {$in: brands}} ,{productImage: 0})
    .sort({productPrice: 1})}
    else if (req.query.order === "descending")
    {var ProductsSearched = await Product.find({productCategory: {$in: categories}, productDistributor : {$in: brands}},{productImage: 0})
    .sort({productPrice: -1})}
    else
    {
        var ProductsSearched = await Product.find({productCategory: {$in: categories}, productDistributor : {$in: brands}},{productImage: 0})
        .find({$text: {$search: req.query.searchString}} , {productImage: 0})
    }
    }
    catch{}
    
    return res.status(200).send(ProductsSearched)
})

/**
 * @swagger
 * /product/bgcolor/{id}:
 *   get:
 *    description: Returns a query according to the search term. (searchs all strings of the schema) 
 *    tags: 
 *    - productBG
 *    parameters:
 *       - in : path
 *         name : id
 *         type: string
 *         required : true
 *    responses:
 *      200:
 *        description: A successful search
 */

router.get('/bgcolor/:id' , async (req,res) =>{

    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) 
    {
       var  wantedProduct = 
       await Product.findById(req.params.id, {productImage: 0}
       ,(err, wantedProduct) => 
       {
            if(err){return null}
            else{return wantedProduct}
       });
    }
    else{wantedProduct = null;}
 
     if(!wantedProduct)
     {
         return res.status(400).send("Product with id: " + req.params.id + " does not exist");
     }
     else{
         //console.log("I am here")
         return res.status(200).json(wantedProduct.productBGcolor);
     }
}
)

/**
 * @swagger
 * /product/bgcolor/{id}:
 *   put:
 *    description: Returns a query according to the search term. (searchs all strings of the schema) 
 *    tags: 
 *    - productBG
 *    parameters:
 *       - in : path
 *         name : id
 *         type: string
 *         required : true
 *       - in : body
 *         name : productBGcolor
 *         schema: 
 *          type: object
 *          properties:
 *            productBGcolor:
 *              type: string
 *              default : "Red"
 *    responses:
 *      200:
 *        description: A successful search
 */

 router.put('/bgcolor/:id' , async (req,res) =>{

    if(req.params.id)
    {
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) 
        {
            await Product.findByIdAndUpdate(req.params.id, {productBGcolor: req.body.productBGcolor}
            ,(err, wantedProduct) => 
            {
                if(err){return null}
                else{return wantedProduct}
            });
            res.status(200).send("Color has been successfuly update")
        }
        else
        {res.status(400).send("Please insert a correct id.")}
        
    }
    else
    {
        res.status(400).send("Please insert an id.")
    }
}
)



/**
 * @swagger
 * /product/imageLink:
 *   put:
 *    description: Returns a query according to the search term. (searchs all strings of the schema) 
 *    tags: 
 *    - product
 *    responses:
 *      200:
 *        description: A successful search
 */

 router.put('/imageLink' , async (req,res) =>{

    if(req.params.id)
    {
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) 
        {
            await Product.findByIdAndUpdate(req.params.id, {productImageLink: `http://localhost:5000/product/image/${req.params.id}`}
            
            ,(err, wantedProduct) => 
            {
                if(err){return null}
                else{return wantedProduct}
            });
            
            await Product.find({}, async function (err, products) {    
                for (var i=0; i<products.length; i++) {       
                    Product.findOne({ _id: products[i]._id }, function (err, doc){
                        doc.productFlutterLink = `http://10.0.2.2:5000/product/image/${doc._id}`;
                        doc.save();
                    });    
                    
                 }  
            });
            res.status(200).send("ImageLink has been updated")
        }
        else
        {res.status(400).send("Please insert a correct id.")}
        
    }
    else
    {
        res.status(400).send("Please insert an id.")
    }
}
)
module.exports = router;