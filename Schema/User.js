var mongoose = require("mongoose");


var userSchema = new mongoose.Schema({
    email: {type: String, unique: true ,required: true},
    password: {type:String, required: true},
    userType: {type: Number, default: 1, enum: [1,2,3]},
    userCart: [{_id: false, Product: {type: mongoose.Schema.Types.ObjectId, ref: 'Products'}, Quantity: {type: Number}}],
    isAuthen: {type: Boolean, default: false},
    purchasedProducts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Products'}],
    invoices: [{type: mongoose.Schema.Types.ObjectId, ref: 'invoices'}]
    //TODO: Cart and products schema
});

var User = mongoose.model('myuser', userSchema);
module.exports = User;
