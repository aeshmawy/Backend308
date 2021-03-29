var mongoose = require("mongoose");


var userSchema = new mongoose.Schema({
    username: {type: String, unique: true ,required: true},
    password: {type:String, required: true},
    userType: {type: Number, default: 1, enum: [1,2,3]}
    //TODO: Cart and products schema
});

var User = mongoose.model('myuser', userSchema);
module.exports = User;
