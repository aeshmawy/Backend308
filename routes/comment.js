var express = require('express');
var router = express.Router();

var User =  require("../Schema/User");
var Product =  require("../Schema/Products");
var Comment = require('../Schema/Comment');


/* GET home page. */
//post a comment to product with given id
/**
 * @swagger
 * /comment/{id}:
 *   post:
 *    description: Posts a comment to product with id in path
 *    tags: 
 *    - Comments
 *    parameters:
 *       - in : path
 *         name : id
 *         type: string
 *         required : true
 *       - in : body
 *         name : Comment
 *         schema: 
 *          type: object
 *          properties:
 *            content:
 *              type: string
 *              default : "This is a comment!"
 *            rating:
 *              type: Number
 *              default: 1
 *              min: 1
 *              max: 5
 *            approved:
 *              type: Boolean
 *              default : False
 *            userID:
 *              type: string
 *    responses:
 *      200:
 *        description: A successful search
 */
router.post('/:id', async (req, res) =>
{//TODO: validate token and check if usertype is 1
    //get product
    if(req.body.rating && req.body.content && req.body.approved != undefined)
    {
        var comment = new Comment({
            content: req.body.content,
            rating: req.body.rating,
            approved: req.body.approved,
            user: req.body.userID
        })
        var onProduct = await Product.findById(req.params.id, {productImage: 0}).populate("productComments");
        
        var unique = true;
        for(var i = 0 ; i < onProduct.productComments.length ; i++)
        {
            
            if(onProduct.productComments[i].user.toString() === comment.user.toString())
            {
                unique = false;
                break;
            }
        }
        if(unique)
        {
            comment.save();
            var onProduct = await Product.findByIdAndUpdate(req.params.id, {$push: {"productComments": comment}},
            {safe: true, new : true});
            
            res.status(200).send("OK")
        }
        else
        {
            res.status(400).send("This user has already commented")
        }
    }
    
});


/**
 * @swagger
 * /comment/{id}:
 *   get:
 *    description: Posts a comment to product with id in path
 *    tags: 
 *    - Comments
 *    parameters:
 *       - in : path
 *         name : id
 *         type: string
 *         required : true
 *    responses:
 *      200:
 *        description: A successful search
 */
router.get('/:id', async (req, res) =>
{//TODO: validate token and check if usertype is 1
    //get product


    var onProduct = await Product.findById(req.params.id , {productImage: 0}).populate('productComments')
    res.status(200).send(onProduct.productComments)
    
    
});

module.exports = router;