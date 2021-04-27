var mongoose = require("mongoose");


var invoiceSchema = new mongoose.Schema({
    name: {type: String},
    address: {type: String},
    city: {type: String},
    country: {type: String},
    postal_code:  {type: String},
    items: [{_id: false, Product: {type: mongoose.Schema.Types.ObjectId, ref: 'Products'}, Quantity: {type: Number}}],
    total: {type: String},
    date: {type: Date}
});

var Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
