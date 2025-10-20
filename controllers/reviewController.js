const wrapAsync = require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");

module.exports.addNewReview= wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  await newReview.save(); // save first
  
  listing.reviews.push(newReview._id); // push only the ID
  await listing.save();

  req.flash("success", "New Review Posted!");
  res.redirect(`/listings/${id}`);
})

module.exports.destroyReview=wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
})