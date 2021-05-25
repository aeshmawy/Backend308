var mongoose = require("mongoose");


var commentSchema = new mongoose.Schema({//add rating when pm approves comment. I need product ID?
    content : {type: String, maxlength: 200 ,required: true},
    rating : {type: Number, min: 0, max: 5 ,required: true},
    user: { type: String ,required: true},
    approved: {type: Boolean, default : false ,required: true},
    productID: {type: mongoose.Schema.Types.ObjectId, ref: 'Products'}
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
