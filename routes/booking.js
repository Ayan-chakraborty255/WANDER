const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middlewares/authmiddleware.js");
const {checkAvailability}=require("../middlewares/checkAvailability.js");

// Show booking form for a specific listing
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const listingId = req.params.id;

        res.render("booking/Book.ejs", {
            listing: { _id: listingId } // pass listing object to EJS
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
    }
});
router.post(
  "/payment",
  isLoggedIn,
  checkAvailability,
  (req, res) => {
    req.flash("success", "Listing available! Proceed to payment.");
    // res.redirect(`/listings/${req.params.id}/book/confirm`);
    res.send("Path is working");
  }
);

module.exports = router;