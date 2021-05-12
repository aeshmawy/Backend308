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
 *    responses:
 *      200:
 *        description: A successful search
 */
router.post('/:id', async (req, res) =>
{//TODO: validate token and check if usertype is 1
    //get product
    console.log(req.session.user)
    if(req.session.loggedIn === true)
    {
        if(req.session.user.isAuthen)//always true for testing. make
        {
            if(req.body.rating && req.body.content && req.body.approved !== undefined)
            {
                var comment = new Comment({
                    content: req.body.content,
                    rating: req.body.rating,
                    approved: false,
                    user: req.session.user.email
                })

                console.log(comment);
                var onProduct = await Product.findById(req.params.id, {productImage: 0}).populate("productComments");
                var purchased = false;
                
                var unique = true;
                for(var i = 0 ; i < onProduct.productComments.length ; i++)
                {
                    
                    if(onProduct.productComments[i].user.toString() === comment.user.toString())
                    {
                        unique = false;
                        break;
                    }
                }
                for(var i = 0 ; i < req.session.user.purchasedProducts.length ; i++)
                {
                    
                    if(onProduct._id.toString() === req.session.user.purchasedProducts[i].toString())
                    {
                        purchased = true;
                        break;
                    }
                }
                if((unique && purchased))//TODO: remove true
                {
                    comment.save();
                    var onProduct = await Product.findByIdAndUpdate(req.params.id, {$push: {"productComments": comment}},
                    {safe: true, new : true});
                    
                    res.status(200).send(comment)
                }
                else if(!purchased)
                {
                    res.status(403).send("This user has not purchased this product")
                }
                else if(!unique)
                {
                    res.status(403).send("This user has already commented on this product")
                }
                else
                {
                    res.status(400).send("Some error has occured")
                }
            }
        }
        else
        {
            res.status(403).send("User is not Authenticated")
        }
    }
    else
    {
        res.status(403).send("User is not logged in")
    }
});


/**
 * @swagger
 * /comment/{id}:
 *   get:
 *    description: give all comments of product of given id
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