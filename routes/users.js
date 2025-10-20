const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/authmiddleware.js");
const { saveRedirectUrl } = require("../middlewares/saveRedirectUrl.js");
const userController = require("../controllers/userController.js");

// /sign-up
router
  .route("/sign-up")
  .get(userController.renderSignUpForm)
  .post(userController.registerUser);

// /login
router
  .route("/login")
  .get(userController.renderLogInForm)
  .post(saveRedirectUrl, userController.authenticateUser, userController.renderRedirectUrl);

// /logout
router.get("/logout", isLoggedIn, userController.userLogOut);

module.exports = router;
