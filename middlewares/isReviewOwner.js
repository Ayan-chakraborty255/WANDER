const Review = require("../models/review");
const User = require("../models/user");
module.exports.isReviewOwner = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "Permission Denied");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
