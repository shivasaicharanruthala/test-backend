import { v4 as uuid4 } from 'uuid';
import transporter from './userValidationServices.js';
import userModel from '../models/prepBuddy.users.models.js';
import PrepBuddyUsersModels from "../models/prepBuddy.users.models.js";
import userValidation from '../models/prepBuddy.userValidation.models.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Retrieves user data from the database by searching with email.
 *
 * @param {object} userformData - User data object containing the email for searching.
 * @returns {Promise<object|null>} - A promise that resolves to the user data or null if not found.
 */
export const getByEmail = async (userformData) => {
    return await userModel.findOne({ "email": userformData.email }).exec();
}

/**
 * Retrieves user data from the database by searching with ID.
 *
 * @param {object} user - User object containing the user ID for searching.
 * @returns {Promise<object|null>} - A promise that resolves to the user data or null if not found.
 */
export const getById = async (user) => {
    return await userModel.findOne({ id: user.id });
}

/**
 * Sends a verification email to the user's email address.
 *
 * @param {object} userformdata - User data object containing information for sending the verification email.
 * @param {object} res - Express response object for handling the response.
 * @returns {void}
 */
export const sendUserVerficationEmail = async (userformdata, res) => {
    const userStatus = await getByEmail(userformdata);
    const currentURL = 'http://localhost:8080/';
    const uniqueString = userStatus.id;

    // Email format which will be sent to user for verification purpose
    const mailOptions = {
        from: 'testemail9121@gmail.com',
        to: userStatus.email,
        subject: 'PrepBuddy Please Verify your email',
        html: `<p>Hi ${userStatus.firstName},<p/><br><p>Please verify your email address to complete the signup and login into your account.<p/>
            <p><b>This link is valid only for 10 mins <b/>.</p>
            <p>Press click<a href=${currentURL + "user/" + userStatus.id + "/verify"}> here <a/> to proceed<p/>`,

    };

    // User is created in userValidation database with an expiry time of 10 mins
    const newVerification = new userValidation({
        userId: uniqueString,
        email: userStatus.email,
        uniqueString: uniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 600000
    })
    //New User created in verification table
    newVerification.save()
        .then(() => {
            transporter.sendMail(mailOptions)
                .then(() => {
                })
                .catch((error) => {
                    ///console.log("Error in email sending ",error);
                })
        })
        .catch((error) => {
            //console.log("Error in savig into database",error);
        })
}

/**
 * Compares the password provided in the user form data with the hashed password in the user model.
 *
 * @param {object} userformData - User data object containing the password to be checked.
 * @param {object} validUser - User model object with the hashed password to compare.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, false otherwise.
 */
export const passwordMatch = async (userformData, validUser) => {
    return await validUser.matchPassword(userformData.password);
}

/**
 * Creates a new user after a successful signup.
 *
 * @param {object} userformData - User data object containing information for creating a new user.
 * @returns {Promise<object>} - A promise that resolves to the newly created user object.
 */
export const post = async (userformData) => {
    const user = {
        id: uuid4(),
        firstName: userformData.firstName,
        lastName: userformData.lastName,
        email: userformData.email,
        password: userformData.password,
        verified: false
    }
    const newUser = new userModel(user);
    return newUser.save();
}

/**
 * Verifies the user's email after clicking the link provided in the email before it expires.
 *
 * @param {string} userId - The ID of the user to be verified.
 * @param {object} req - Express request object for handling the request.
 * @param {object} res - Express response object for handling the response.
 * @returns {void}
 */
export const userVerfication = async (userId, req, res) => {
    userValidation.findOne({ "userId": userId }).then((userValidationRecord) => {
        if (userValidationRecord) {
            //Record fetched from uservalidation table
            const expiresAt = userValidationRecord.expiresAt;
            if (expiresAt < Date.now()) {
                //Record is expired
                userValidation.deleteOne({ "userId": userId }).then(result => {
                    userModel.deleteOne({ "id": userId }).then(() => {
                        let message = "Link has expired Please SignUp again";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    }).catch(() => {
                        let message = "Error occured while while deleting the existing user Model record";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    })
                })
                    .catch((err) => {
                        let message = "Error occured while deleting the existing user validation record";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    })
            }
            else {
                //Valid record Exists
                userModel.updateOne({ id: userId }, { verified: true })
                    .then(() => {
                        userValidation.deleteOne({ "userId": userId })
                            .then(() => {
                                //Send the verfied html file as status
                                res.sendFile(`${dirname(fileURLToPath(import.meta.url))}/verified.html`);
                            })
                            .catch((err) => {
                                let message = "Error occured while finalizing successful record";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            })
                    })
                    .catch((err) => {
                        let message = "Error occured while updating user verification record";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    })
            }
        }
        else {
            let message = "User record doesn't exist or it has been verified already. Please signin or signup"
            res.redirect(`/user/verified/error=true&message=${message}`);
        }
    }).catch((err) => {
        let message = "Error occured while checking existing valid record";
        res.redirect(`/user/verified/error=true&message=${message}`);
    })
}

/**
 * Gets user emails by searching with user IDs.
 *
 * @param {string} userId - The ID of the user for whom emails are fetched.
 * @param {string} interviewerId - The ID of the interviewer for whom emails are fetched.
 * @returns {Promise<Array>} - A promise that resolves to an array of user emails.
 */
export const GetUserEmailsById = async (userId, interviewerId) => {
    return await PrepBuddyUsersModels.find( { $or: [{id: userId}, {id: interviewerId}] } ).select('email').exec()
}