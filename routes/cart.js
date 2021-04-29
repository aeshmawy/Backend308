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

function inCart(array, productID)//array is cart, element is product id. check if product id is in cart
{
    var unique = -1;
    
    for(var i = 0; i < array.length; i++)
    {
        
        if(array[i].Product._id.toString() === productID)
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
                element.Quantity = parseInt(req.params.quantity);
                if(req.session.loggedIn === true)
                {
                    var founduser = await User.findById(req.session.user._id).populate("userCart.Product");
                    var isUnique = Unique(founduser.userCart, element);
                    if( isUnique === -1)//it is unique
                    {
                        
                        founduser.userCart.push(element);
                        await founduser.save();
                        res.status(200).send("Logged In : Unique Element added")
                    }
                    else//its not unique
                    {
                        founduser.userCart[isUnique].Quantity = parseInt(founduser.userCart[isUnique].Quantity, 10) + parseInt(req.params.quantity, 10);
                        if(founduser.userCart[isUnique].Quantity > wantedProduct.productStock)
                        {
                            res.status(400).send("Cant add anymore of the element to the cart.")
                        }
                        else{
                            await founduser.save();
                            res.status(200).send("Logged In : Same Element added")
                        }
                        
                        
                        
                    }
                    req.session.user.userCart = founduser.userCart;
                    
                }
                else if(!req.session.loggedIn)
                {
                    if(req.session.userCart)//checking if cart exists
                    {
                        var isUnique = Unique(req.session.userCart, element);
                        if( isUnique === -1)
                        {
                            req.session.userCart.push(element);
                            res.status(200).send("Logged Out : Unique Element added")
                        }
                        else
                        {
                            req.session.userCart[isUnique].Quantity = parseInt(req.session.userCart[isUnique].Quantity,10) + parseInt(req.params.quantity, 10);;
                            if(req.session.userCart[isUnique].Quantity > wantedProduct.productStock)
                            {
                                res.status(400).send("Cant add anymore of the element to the cart.")
                            }
                            else{
                                res.status(200).send("Logged Out : Same Element added")
                            }
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
 * /cart/remove/{productid}/{quantity}:
 *  delete:
 *    description: delete from cart.
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
 router.delete('/remove/:productid/:quantity', async (req, res) =>{
    
    if (req.params.productid.match(/^[0-9a-fA-F]{24}$/)) 
    {
        if(req.session.loggedIn === true)
        {
            
            var founduser = await User.findById(req.session.user._id).populate("userCart.Product");
            var inCarto = inCart(founduser.userCart, req.params.productid);
            if(inCarto === -1)
            {
                return res.status(400).send("Logged in: item is not in the cart")
            }
            else if(parseInt(req.params.quantity) < parseInt(founduser.userCart[inCarto].Quantity))
            {
                founduser.userCart[inCarto].Quantity = parseInt(founduser.userCart[inCarto].Quantity) - parseInt(req.params.quantity)
                await founduser.save();
                req.session.user.userCart = founduser.userCart;
                return res.status(200).send(req.params.quantity + " of the item have been removed from the cart(item is still in cart)")
            }
            else if(parseInt(req.params.quantity) === parseInt(founduser.userCart[inCarto].Quantity))
            {
                if(inCarto === req.session.user.userCart.length)
                {founduser.userCart.pop();}
                else{founduser.userCart.splice(inCarto, 1);}
                
                await founduser.save();
                req.session.user.userCart = founduser.userCart;
                return res.status(200).send("Logged in: Item has been completely removed from the cart")
            }
            else{
                
                return res.status(400).send("Logged in: You cannot remove that many items")
            }
            
        }
        else if(req.session.userCart)
        {
            var inCarto = inCart(req.session.userCart, req.params.productid);
            if(inCarto === -1)
            {
                return res.status(400).send("Logged out:Item is not in the cart")
            }
            else if(parseInt(req.params.quantity) < parseInt(req.session.userCart[inCarto].Quantity))
            {
                req.session.userCart[inCarto].Quantity = parseInt(req.session.userCart[inCarto].Quantity) - parseInt(req.params.quantity)
                
                return res.status(200).send(req.params.quantity + " of the item have been removed from the cart(item is still in cart)")
            }
            else if(parseInt(req.params.quantity) === parseInt(req.session.userCart[inCarto].Quantity))
            {
                if(inCarto === req.session.userCart.length)
                {req.session.userCart.pop();}
                else{req.session.userCart.splice(inCarto, 1);}
                return res.status(200).send("Item has been removed from the cart")
            }
            else{
                return res.status(400).send("You cannot remove that many items")
            }
        }
        else
        {res.status(400).send("UserCart is empty")}
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
 *      - test
 *    responses:
 *      '200':
 *        description: found cart successfully
 *      '400':
 *        description: no such user
 */

router.get('/', async (req, res) =>{
    if(req.headers['Authorization'])
    {
        req.headers['cookies'] = req.headers['Authorization'];
    }
    var totalprice = 0;
    if(req.session.loggedIn === true)
    {
        var founduser = (await User.findById(req.session.user._id).populate("userCart.Product")).toObject();//toobject allows me to add new fields
        var easierToAccess = [];
        var element = {};
        for(var i = 0; i < founduser.userCart.length;i++)
        {
            founduser.userCart[i].Product.quantity = founduser.userCart[i].Quantity;
            totalprice += (founduser.userCart[i].Product.productPrice * founduser.userCart[i].Quantity )
            element = founduser.userCart[i].Product;
            easierToAccess.push(element);
        }
        req.session.totalprice = parseFloat(totalprice).toFixed(2);
        req.session.user.userCart = founduser.userCart;
       
        res.status(200).send(easierToAccess);
    }
    else if(req.session.userCart)
    {
        var easierToAccess = [];
        var element = {};
        for(var i = 0; i < req.session.userCart.length;i++)
        {
            req.session.userCart[i].Product.quantity = req.session.userCart[i].Quantity;
            element = req.session.userCart[i].Product;
            totalprice += (req.session.userCart[i].Product.productPrice * req.session.userCart[i].Quantity )
            easierToAccess.push(element);
        }
        req.session.totalprice = parseFloat(totalprice).toFixed(2);
        
        res.status(200).send(easierToAccess);
    }
    else{
        res.status(200).json([]);   
    }
 })

 router.get('/test',async(req,res)=>{
    res.render('index');
 })
 
module.exports = router;
