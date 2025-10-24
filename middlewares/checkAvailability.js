const Booking = require("../models/bookings");
const Listing = require("../models/listing");

module.exports.checkAvailability =async (req, res, next) => {
  const { id } = req.params;
  const { checkIn, checkOut, adults, children } = req.body;
  if (!checkIn || !checkOut) {
    req.flash("error", "Both Check-in and Check-out date is needed ");
    return res.redirect(`/listings/${id}/book`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const overlapping=await Booking.findOne({
    listing:id,
    $or:[{
        checkIn:{$lt:checkOutDate},
        checkOut:{$gt:checkInDate}
    }]
  })
  if (overlapping) {
    req.flash("error", "Sorry, this listing is unavailable for your selected dates.");
    return res.redirect(`/listings/${id}/book`);
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  const totalGuest=(parseInt(adults))+(parseInt(children)/2);
  const maxGuest=listing.maxGuest || 4;
  if(totalGuest>maxGuest){
    req.flash("error",`Maximum capacity for this listing is ${maxGuest} guests.`);
    return res.redirect(`/listings/${id}/book`);
  }
  req.flash("success", "Available! You can proceed to book this stay.");
  next();

};

