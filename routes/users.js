var express = require('express');
var router = express.Router();

let {getUser,signup,login,checkEmail,resetPassword}=require("../modules/user")

router.get("/getuser",getUser)
router.post("/signup", signup);
router.patch("/login",login);
router.patch("/checkEmail",checkEmail);
router.patch("/resetPassword",resetPassword);


module.exports = router;
