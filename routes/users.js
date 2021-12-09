var express = require('express');
var router = express.Router();

let {getUser,signup,login,checkEmail,forgetPassword,resetPassword}=require("../modules/user")

router.get("/getuser",getUser)
router.post("/signup", signup);
router.patch("/login",login);
router.patch("/checkEmail",checkEmail);
router.patch("/forgetPassword",forgetPassword)
router.patch("/resetPassword",resetPassword);

module.exports = router;
