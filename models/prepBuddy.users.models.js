import mongoose from 'mongoose';
import bcrypt from "bcrypt";

const SALT_ROUNDS = 8;

/**
 * Mongoose schema for user documents.
 *
 * @typedef {Object} UserSchema
 * @property {String} id - Unique identifier for the user.
 * @property {String} firstName - First name of the user.
 * @property {String} lastName - Last name of the user.
 * @property {String} email - Email of the user.
 * @property {String} password - Encrypted password of the user.
 * @property {Boolean} verified - Verification status of the user.
 * @property {Object} timestamps - Auto-generated timestamps for 'createdAt' and 'updatedAt'.
 */

/**
 * Mongoose schema definition for user documents.
 *
 * @type {mongoose.Schema}
 */
const schema = new mongoose.Schema(
    {
        id : {
            type : String,
            required: 'ID is required'
        },
        firstName:{
            type: String,
            required: 'firstName is required'
        },
        lastName:{
            type: String,
            required: 'lastName is required',
        },
        email:{
            type: String,
            required: 'email is required',
        },
        password:{
            type: String,
            required: 'password is required',
        },
        verified:{
            type: Boolean,
            required: 'Verfication is required'
        }
    },
    {timestamps: true}
)

/**
 * Mongoose middleware (pre-save hook) to encrypt the user's password before saving to the database.
 *
 * @function
 * @name preSave
 * @memberof UserSchema
 * @param {function} next - Callback function to be called after the middleware completes.
 * @returns {undefined}
 * @throws {Error} If an error occurs during password encryption.
 */
schema.pre("save",async function preSave(next) {
    const user = this
    if(!user.isModified('password')) {
        next();
    }

    try {
        // Encrypts the password with 8 salt rounds
        const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
        user.password = hash;
    } catch(err) {
        return next(err);
    }
  });

/**
 * Mongoose method to compare a plain text password with the user's hashed password.
 *
 * @function
 * @name matchPassword
 * @memberof UserSchema
 * @param {string} user - Plain text password to be compared.
 * @returns {Promise<boolean>} A Promise that resolves to true if the passwords match, and false otherwise.
 */
schema.methods.matchPassword = async function (user){
    return await bcrypt.compare(user , this.password);
}
const userModel = mongoose.model('users' , schema)

export default userModel;