const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const passport = require("passport");





module.exports.renderSignUpForm = (req, res) => {
  res.render("Users/signup.ejs");
};

module.exports.registerUser = wrapAsync(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long");
      return res.redirect("/sign-up");
    }

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.logIn(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", `Hi ${username}!, Welcome to Wanderlust`);
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/sign-up");
  }
});

module.exports.renderLogInForm = (req, res) => {
  res.render("Users/login.ejs");
};

module.exports.authenticateUser = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true,
});
module.exports.renderRedirectUrl = wrapAsync(async (req, res) => {
  req.flash("success", `Hi ${req.body.username}!, Wellcome back to Wanderlust`);
  const redirectUrl = res.locals.redirectURL || "/listings";
  res.redirect(redirectUrl);
});

module.exports.userLogOut = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
