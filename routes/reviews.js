const express=require("express");
const router=express.Router({ mergeParams: true });

const {validateReview}=require("../middlewares/validateReview.js");
const { isLoggedIn } = require("../middlewares/authmiddleware.js");
const { isReviewOwner } = require("../middlewares/isReviewOwner.js");

const reviewController=require("../controllers/reviewController.js");







//review route
router.post("/", isLoggedIn, validateReview,reviewController.addNewReview);


//review delete
router.delete("/:reviewId",isLoggedIn,isReviewOwner,reviewController.destroyReview);


module.exports=router;