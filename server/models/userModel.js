const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email : {type:String,required:true},
    passwordHash : {type:String,required:true},
});

// create mongodb collection with names user"s" with userSchema

const User = mongoose.model("user",userSchema);

module.exports = User;