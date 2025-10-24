const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

module.exports.index = wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});
module.exports.renderNewListingForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }, // ✅ populate each review’s author
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Lissting You Requested For Doesn't Exists");
    res.redirect("/listings");
  } else {
    res.render("listings/show.ejs", {
      listing,
      googleMapsKey: process.env.GOOGLE_MAPS_API_KEY,
    });
  }
});

module.exports.addNewListingToDb = wrapAsync(async (req, res, next) => {
  const { listing } = req.body;
  if (!listing) {
    req.flash("error", "Send valid data for listing");
    return res.redirect(req.get("referer") || "/listings");
  }

  const newListing = new Listing(listing);
  newListing.owner = req.user._id;

  // Parse maxGuests to number
  if (listing.maxGuests) {
    newListing.maxGuests = parseInt(listing.maxGuests);
  }

  // Handle categories
  if (listing.categories) {
    newListing.categories = Array.isArray(listing.categories)
      ? listing.categories
      : [listing.categories];
  }

  // Handle image
  if (req.file) {
    newListing.image = { url: req.file.path, filename: req.file.filename };
  }

  // Forward Geocoding
  if (newListing.location) {
    try {
      const response = await client.geocode({
        params: { address: newListing.location, key: GOOGLE_MAPS_KEY },
      });

      if (response.data.results.length > 0) {
        const loc = response.data.results[0].geometry.location;
        newListing.geometry = {
          type: "Point",
          coordinates: [loc.lng, loc.lat],
        };
      } else {
        req.flash("error", "Invalid location! Please enter a correct address.");
        return res.redirect(req.get("referer") || "/listings");
      }
    } catch (err) {
      req.flash(
        "error",
        "Error while fetching location data. Please try again later."
      );
      return res.redirect(req.get("referer") || "/listings");
    }
  }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
});


module.exports.renderEditListingForm = wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Lissting You Requested For Doesn't Exists");
    res.redirect("/listings");
  } else {
    let originalImageUrl = listing.image.url.replace(
      "/upload/",
      "/upload/w_250,c_fill/"
    );
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  }
});

module.exports.updateListingInDb = wrapAsync(async (req, res) => {
  let { id } = req.params;
  const newListing = await Listing.findById(id);
  const { title, description, price, location, country, maxGuests } = req.body.listing;
  if (title) listing.title = title;
  if (description) listing.description = description;
  if (price) listing.price = price;
  if (location) listing.location = location;
  if (country) listing.country = country;
  if (maxGuests) listing.maxGuests = parseInt(maxGuests);
  //for category
  if (req.body.listing.categories && req.body.listing.categories.length > 0) {
    newListing.categories = Array.isArray(req.body.listing.categories)
      ? req.body.listing.categories
      : [req.body.listing.categories];
  }


  
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  }
  // --- Forward Geocoding if location changed ---
  if (req.body.listing.location) {
    try {
      const response = await client.geocode({
        params: { address: req.body.listing.location, key: GOOGLE_MAPS_KEY },
      });

      if (response.data.results.length > 0) {
        const loc = response.data.results[0].geometry.location;
        newListing.geometry = {
          type: "Point",
          coordinates: [loc.lng, loc.lat],
        };
      } else {
        req.flash("error", "Invalid location! Please enter a correct address.");
        return res.redirect(req.get("referer") || `/listings/${id}`); // stop execution
      }
    } catch (err) {
      req.flash(
        "error",
        "Error while fetching location data. Please try again later."
      );
      return res.redirect(req.get("referer") || `/listings/${id}`); // stop execution
    }
  }

  await newListing.save();
  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
});


module.exports.filter =wrapAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find all listings that include the selected category
  const allListings = await Listing.find({ categories: id });

  if (allListings.length > 0) {
    res.locals.success = `Listings filtered by ${id}!`;
    res.render("listings/index.ejs", { allListings });
  } else {
    req.flash("error", `No listings found for category "${id}"!`);
    res.redirect("/listings");
  }
});



module.exports.search = async (req, res) => {
  try {
    let input = req.query.q;

    
    if (!input || input.trim() === "") {
      req.flash("error", "Please enter a search query!");
      return res.redirect("/listings");
    }

    
    input = input.trim().replace(/\s+/g, " ");

    
    const element = input
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  
    const fields = ["title", "categories", "country", "location"];

    let allListings = [];

  
    const regexPattern = element.replace(/\s+/g, "[-\\s]*");

    
    for (const field of fields) {
      let query = {};

      if (field === "categories") {
        
        query[field] = { $elemMatch: { $regex: regexPattern, $options: "i" } };
      } else {
        query[field] = { $regex: regexPattern, $options: "i" };
      }

      allListings = await Listing.find(query).sort({ _id: -1 });

      if (allListings.length > 0) {
        res.locals.success = `Listings found by ${field.charAt(0).toUpperCase() + field.slice(1)}!`;
        return res.render("listings/index.ejs", { allListings });
      }
    }

    //Check if input is a number → search by price
    const intValue = parseInt(element, 10);
    if (!isNaN(intValue)) {
      allListings = await Listing.find({ price: { $lte: intValue } }).sort({ price: 1 });
      if (allListings.length > 0) {
        res.locals.success = `Listings with price ≤ Rs ${intValue}!`;
        return res.render("listings/index.ejs", { allListings });
      }
    }

  
    req.flash("error", "No listings found matching your search!");
    return res.redirect("/listings");

  } catch (err) {
    console.error("Search error:", err);
    req.flash("error", "Something went wrong during search!");
    return res.redirect("/listings");
  }
};










module.exports.destroyListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
});
