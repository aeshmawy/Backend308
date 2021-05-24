var mongoose = require("mongoose");


var pdfSchema = new mongoose.Schema({
    invoiceID: {type: mongoose.Schema.Types.ObjectId, ref: 'Invoice'},
    invoicePDF:{type: Buffer,select: false,}
});

var PDF = mongoose.model('PDF', pdfSchema);
module.exports = PDF;
