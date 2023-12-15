import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'

// imports user model schema
import userModel from '../models/prepBuddy.users.models.js';

/**
 * Middleware to protect routes by verifying the presence and validity of a bearer token in the request header.
 * If the token is valid, it decodes it, retrieves user data from the database (excluding the password),
 * and attaches the user object to the request for further processing.
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next function.
 * @throws {Error} - Throws an error with status 403 if the token is invalid or not present, and status 401 if no token is found.
 */
const protect = asyncHandler(async (req , res , next) => {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        try{
            // Splits the bearer token
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token , process.env.JWT_SECRET);
            // sends the user data from database by removing the password
            req.user = await userModel.findOne({id: decoded.id}).select('-password');

            next();
        }
        catch(err)
        {
            res.status(403);
            throw new Error('Not authorized no token')
        }
    }

    if(!token) {
        res.status(401);
        throw new Error('No token')
    }
})

export default protect;