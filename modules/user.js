const User= require("../models/user");
const Joi= require("joi");
const bcrypt= require("bcrypt");
const jwt= require("jsonwebtoken");
const nodemailer= require("nodemailer");
const smtpTransport= require("nodemailer-smtp-transport");
const { func } = require("joi");
require('events').EventEmitter.prototype._maxListeners = 100;


exports.signup= async (req,res,next)=>{
    try{
    //User Input Validation - Joi Validation

    const schema= Joi.object({
        firstName:Joi.string().max(10).required(),
        lastName:Joi.string().max(10).required(),
        userName:Joi.string().min(6).max(50).email().required(),
        password:Joi.string().min(8).max(50).required(),

    })

    var {error}= await schema.validate(req.body);
    if(error) return res.status(400).send({msg:error.details[0].message});

//Email already exists
var existUser = await User.findOne({userName:req.body.userName}).exec();
if(existUser) return res.status(400).send({msg:"Email already exists"});

//Create / user
const salt = await bcrypt.genSalt(10);
req.body.password= await bcrypt.hash(req.body.password, salt);

const user = new User({  
random_string:"fhfj12",
firstName:req.body.firstName,
lastName:req.body.lastName,
userName:req.body.userName,
password:req.body.password
})

var response= await user.save();
res.send(response);
    }catch(err){
        console.log("Errors while signing in", err)
    }
}


exports.login= async(req,res,next)=>{

    const emitter=new EventEmitter()
    emitter.setMaxListeners(100)
    //User Input Validation - Joi Validation
    const schema= Joi.object({
        userName:Joi.string().min(6).max(50).email().required(),
        password:Joi.string().min(8).max(50).required()

    })

    var {error}= await schema.validate(req.body);
    if(error) return res.status(400).send({msg:error.details[0].message});

    //Is registered User
    var existUser= await User.findOne({"userName":req.body.userName}).exec();
    if(!existUser) return res.status(400).send({msg:"User does not exists"});

     //Check Password
     const isvalid= await bcrypt.compare(req.body.password,existUser.password);
     if(!isvalid)return res.status(403).send({msg:"Wrong Password..."});

    //Generate Token
    var token= jwt.sign({existUser},'SWERA', {expiresIn:"1000000h"});
    res.send(token);
}


exports.getUser=async(req,res,next)=>{
    var response= await User.find();
    res.send(response);
}


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
};

const clear=async()=>{
    await User.updateOne({userName:process.env.EMAIL_ID},{$unset:{random_string:1}})

}

exports.getUser=async(req,res,next)=>{
    var response=await User.find();
    res.send(response)
    
}

   
exports.checkEmail=async(req,res,next)=>{

    var existUser=await User.findOne({"userName":req.body.userName}).exec();
    if(!existUser) return res.status(400).send({msg:"User does not exists"});
    
    
   console.log(existUser);
   const random_strings=makeid(6);

   await User.findOneAndUpdate(
    {userName:existUser.userName},
    {random_string:random_strings}
    )
    
    console.log(random_strings);
    console.log("random string added...")

     var transporter = nodemailer.createTransport(smtpTransport({
        service:"gmail",
        auth:{
            user:"karthicksrinivasan333@gmail.com",
            pass:"Karthick@123"
        }
    }))

        const mailOptions = {
        from: 'karthicksrinivasan333@gmail.com',
        to: req.body.userName,
        subject: 'Reset your password',
        text: `Reset your password, By using this random-string
               ${random_strings}` };
    
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
          res.status(400).send({msg:"Something was get wrong while sending email", error});
            }else{
                console.log(process.env.EMAIL_ID);
                process.env.EMAIL_ID=req.body.userName
                console.log(process.env.EMAIL_ID);
                res.status(200).send({msg:"Action Successful"});
            }
        })
}

exports.forgetPassword=async(req,res,next)=>{
       
    const existUser=await User.findOne({random_string:req.body.random_string}).exec();
    if(!existUser) return res.status(400).send({msg:"The random_string does not matches"})
    
    return res.status(200).send({msg:"The entered random string is verified..."})
}


exports.resetPassword=async(req,res)=>{

    const salt = await bcrypt.genSalt(10);
    req.body.new_password= await bcrypt.hash(req.body.new_password, salt);
    
    console.log(req.body.new_password)
      await User.findOneAndUpdate({userName:process.env.EMAIL_ID},{password:req.body.new_password},function(err,docs){
          if(err){
              console.log(err);
              res.status(400).send({msg:"Resetting password was failed..."})

          }else{
              clear();
              console.log("Original Doc:", docs)
              res.send({msg:"Password resetted successfully...",docs});

          }
      }).clone().catch(function(err){console.log(err)})

}
