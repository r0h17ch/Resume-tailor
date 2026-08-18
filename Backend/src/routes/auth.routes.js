const express = require("express");
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @description register a new user, expects username, email and password in the request body. It will hash the password before saving it to the database. If the username or email already exists, it will return an error.
 * @access public
 */
authRouter.post("/register", authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description login a user, expects email and password in the request body. It will check if the email exists and if the password is correct.
 * @access public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @description logout a user, it will clear the token cookie.
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController);


/**
 * @route GET /api/auth/get-me
 * @description get the current logged-in user's information
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


module.exports = authRouter;