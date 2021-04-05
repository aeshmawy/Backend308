var mongoose = require("mongoose");

//ID, name, model, number,
//description, quantity in stocks, price, warranty status, and distributor information.

var productSchema = new mongoose.Schema({
    
    //productID: {type:Number, required: true}, Mongodb intializes an ID automatically
    productSize: {type:String , required: true, default: "Standard"},
    productName: {type:String , required: true},
    productDescription: {type:String , default: "Some description."},
    productStock: {type:Number , default : 10 , min: 0},
    productPrice: {type:Number, default: 15 ,min:0},
    productDiscount: {type: Number , default: 5 ,min:0, max:100},
    productBestseller: {type: Boolean, default: false},
    productRating: {type:Number, min:0 , max: 5},
    productNumofRatings: {type: Number, min: 0 , default: 0},
    //productWarranty: {type:Number}
    productDistributor: {type: String , default: "Some Art Company"},
    productCategory: {type: String , enum:["Brush" , "Canvas" , "Paint", "Painting"]},
    productBGcolor: {type: String, default: "Peach"}, //TODO: make a put request to change this
    productImage:{type: Buffer}


});
productSchema.index({'$**' : 'text'});
var Product = mongoose.model('Products', productSchema);
module.exports = Product;
