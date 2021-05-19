var mongoose = require("mongoose");


var refundSchema = new mongoose.Schema({
    email: {type: String},
    productID: {type: mongoose.Schema.Types.ObjectId, ref: 'Products'},
    invoiceID: {type: mongoose.Schema.Types.ObjectId, ref: 'Invoice'},
    quantity: {type: Number},
    approved: {type: Boolean, default: false},
    PriceatPurchase: {type: Number}
});

var Invoice = mongoose.model('Refunds', refundSchema);
module.exports = Invoice;
