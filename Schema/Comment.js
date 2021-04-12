var mongoose = require("mongoose");


var commentSchema = new mongoose.Schema({
    content : {type: String, maxlength: 200 ,required: true},
    rating : {type: Number, min: 0, max: 5 ,required: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,required: true},
    approved: {type: Boolean, default : false ,required: true}
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
