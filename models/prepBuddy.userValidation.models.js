import mongoose, { Schema } from 'mongoose';

/**
 * Mongoose schema for validation documents.
 *
 * @typedef {Object} ValidationSchema
 * @property {String} userId - User identifier associated with the validation entry.
 * @property {String} email - Email associated with the validation entry.
 * @property {String} uniqueString - Unique string generated for validation purposes.
 * @property {Date} createdAt - Timestamp indicating when the validation entry was created.
 * @property {Date} expiresAt - Timestamp indicating the expiration time of the validation entry.
 */

/**
 * Mongoose schema definition for validation documents.
 *
 * @type {mongoose.Schema}
 */
const validationSchema = new Schema({
    userId : String,
    email : String,
    uniqueString : String,
    createdAt : Date,
    expiresAt : Date
});

const userValidation = mongoose.model('userValidation' , validationSchema);
export default userValidation;