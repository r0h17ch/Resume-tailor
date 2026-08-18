const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model");



/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body. It will hash the password before saving it to the database.
 * @route POST /api/auth/register
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            message : "Please provide username, email and Password"
        })
    }
    const isUserAlreadyExist = await userModel.findOne({
        $or: [{username},{email}]
    })
    if (isUserAlreadyExist){
        return res.status(400).json({
            message : "Account already exists with this email address or username"
        })
    }
    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        username,
        email,
        password : hash
    })
    const token = jwt.sign(
        {id : user._id, username : user.username},
        process.env.JWT_SECRET,
        {expiresIn : "1d"}
    )
    res.cookie("token", token);
    res.status(201).json({
        message : "User registered successfully",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
}



/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body. It will check if the email exists and if the password is correct.
 * @route POST /api/auth/login
 */
async function loginUserController(req, res) {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message : "Please provide email and password"
        })
    }
    const user = await userModel.findOne({email})
    if (!user) {
        return res.status(400).json({
            message : "Account does not exist with this email address"
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            message : "Invalid password"
        })
    }
    const token = await jwt.sign(
        {id : user._id, username : user.username},
        process.env.JWT_SECRET,
        {expiresIn : "1d"}
    )
    res.cookie("token", token);
    res.status(200).json({
        message : "User logged in successfully",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
}



/**
 * @name logoutUserController
 * @description logout a user, it will clear the token cookie. and put the token in blacklist so that it cannot be used again.
 * @route GET /api/auth/logout
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token;
    if (token) {
        await tokenBlacklistModel.create({token});
    }
    res.clearCookie("token")
    res.status(200).json({
        message : "User logged out successfully"
    })
}



/**
 * @name getMeController
 * @description get the current logged-in user's information
 * @route GET /api/auth/get-me
 */
async function getMeController(req, res) {
    const user = await userModel.findById( req.user.id )
    return res.status(200).json({
        message : "current user fetched successfully",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
}



module.exports = { registerUserController, loginUserController, logoutUserController, getMeController };