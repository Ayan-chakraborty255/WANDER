const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const { isLoggedIn } = require("../middlewares/authmiddleware.js");
const { isOwner } = require("../middlewares/isOwner.js");
const { validateListing } = require("../middlewares/validateListing.js");

const listingControllers = require("../controllers/listingController.js");

//index route + create route
router
  .route("/")
  .get(listingControllers.index)
  .post(
  isLoggedIn,
  upload.single("listing[image]"), 
  validateListing,               
  listingControllers.addNewListingToDb
);


// New listing form
router.get("/new", isLoggedIn, listingControllers.renderNewListingForm);
//filter buttons
router.get("/filter/:id",listingControllers.filter);
//search
router.get("/search", listingControllers.search);

// Edit listing form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  listingControllers.renderEditListingForm
);

//show route + Update route + delete route
router
  .route("/:id")
  .get(listingControllers.showListing)
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    listingControllers.updateListingInDb
  )
  .delete(isLoggedIn, isOwner, listingControllers.destroyListing);

module.exports = router;
