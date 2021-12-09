const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loginSchema = new Schema({
    userName:{
        type:String,
        minLength:10,
        maxLength:40
    },
    firstName:{
        type:String,
        maxLength:25
    },
    lastName:{
     type:String,
     maxLength:25
    },
    password:{
        type:String,
        minlength:8
    },
    random_string:{
        type:String
    }});

const user = mongoose.model("user",loginSchema,"user");
module.exports=user;