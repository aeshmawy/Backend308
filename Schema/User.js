var mongoose = require("mongoose");


var userSchema = new mongoose.Schema({
    username: {type: String, unique: true ,required: true},
    password: {type:String, required: true},
    userType: {isSM: {type: Boolean, default: false} ,isPM:{type: Boolean, default: false}}
    //TODO: Cart and products schema
});

var User = mongoose.model('myuser', userSchema);
module.exports = User;
