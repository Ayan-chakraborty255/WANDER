const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");


const userSchema=new Schema({
    email:{
        type: String,
        required:true
    }
    //passportLocalMongoose automatically define username,password,also take care of hashing(pdkbf2 hasing algo) and salting
});
userSchema.plugin(passportLocalMongoose);
userSchema.pre("save", function(next) {
  if (this.password && this.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  next();
});
module.exports=mongoose.model("User",userSchema);