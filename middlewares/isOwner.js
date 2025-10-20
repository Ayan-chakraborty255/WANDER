const Listing=require("../models/listing");
module.exports.isOwner=async(req,res,next)=>{
    const { id } = req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        req.flash("error","Permission Denied");
        return res.redirect(`/listings/${id}`);
    }
    next();
}