var express = require('express');
var router = express.Router();

const Product = require('../Schema/Products');
var User =  require("../Schema/User");
var database = require("../Schema/dbconnect.js");


function Unique(array, element)
{
    var unique = -1;
    for(var i = 0; i < array.length; i++)
    {
        
        if(array[i].Product._id.toString() === element.Product._id.toString())
        {
            unique = i;
            break;
        }
    }
    return unique;
}



/**
 * @swagger
 * /cart/add/{productid}/{quantity}:
 *  post:
 *    description: get cart.
 *    tags:
 *      - cart
 *    parameters:
 *       - in : path
 *         name: productid
 *         required: true
 *         type: string
 *       - in : path
 *         name: quantity
 *         required: true
 *         default : 1
 *         type: number
 *    responses:
 *      '200':
 *        description: found cart successfully
 *      '400':
 *        description: no such user
 */
router.post('/add/:productid/:quantity', async (req, res) =>{
    
    if (req.params.productid.match(/^[0-9a-fA-F]{24}$/)) 
    {
        var  wantedProduct = 
        await Product.findById(req.params.productid
        ,(err, wantedProduct) => 
        {
                if(err){return null}
                else{return wantedProduct}
        });
        if(wantedProduct)
        {
            if(wantedProduct.productStock > req.params.quantity)
            {
                
                var newStock = wantedProduct.productStock;//- req.params.quantity; should i adjust stock here?
                var addtocart = await Product.findByIdAndUpdate(req.params.productid, {productStock : newStock}, {new: true}).select("-productImage -productComments");
                var element = {};
                element.Product = addtocart;
                element.Quantity = req.params.quantity;
                if(req.session.loggedIn === true)
                {
                    var founduser = await User.findById(req.session.user._id);
                    var isUnique = Unique(founduser.userCart, element);
                    if( isUnique === -1)
                    {
                        founduser.userCart.push(element);
                        founduser.save();
                        res.status(200).send("Logged In : Unique Element added")
                    }
                    else
                    {
                        founduser.userCart[isUnique].Quantity = parseInt(founduser.userCart[isUnique].Quantity, 10) + parseInt(req.params.quantity, 10);
                        founduser.save();
                        res.status(200).send("Logged In : Same Element added")
                    }
                    
                }
                else if(!req.session.loggedIn)
                {
                    if(req.session.userCart)
                    {
                        var isUnique = Unique(req.session.userCart, element);
                        if( isUnique === -1)
                        {
                            req.session.userCart.push(element);
                            res.status(200).send("Logged Out : Unique Element added")
                        }
                        else
                        {
                            req.session.userCart[isUnique].Quantity = req.session.userCart[isUnique].Quantity + req.params.quantity;
                            res.status(200).send("Logged Out : Same Element added")
                        }
                        
                    }
                    else
                    {
                        req.session.userCart = [];
                        req.session.userCart.push(element);
                        res.status(200).send("Logged Out : First Element added")
                    }
                }
            }
            else
            {
                res.status(400).send("Product is out of stock")
            }
        }
        else
        {
            res.status(400).send("No Product exists with id " + req.params.productid );
        }
        
    }
    else
    {
        res.status(400).send("Product id is not valid");
    }
    

});

/**
 * @swagger
 * /cart:
 *  get:
 *    description: get cart.
 *    tags:
 *      - cart
 *    responses:
 *      '200':
 *        description: found cart successfully
 *      '400':
 *        description: no such user
 */

router.get('/', async (req, res) =>{
    if(req.session.loggedIn === true)
    {
        var founduser = await User.findById(req.session.user._id);
        res.status(200).send(founduser.userCart);
    }
    else if(req.session)
    {
        res.status(200).send(req.session.userCart);
    }
    else{
        res.status(200).send("Cart is empty");
    }
 })

module.exports = router;