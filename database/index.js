import mongoose from 'mongoose';
import * as dotenv from 'dotenv'

dotenv.config() // setup .env file

/**
 * Connects to MongoDB using the provided connection string and returns the database object.
 *
 * @async
 * @function
 * @returns {Promise<Object>} - A Promise that resolves to the MongoDB database object.
 * @throws {Error} - Throws an error if there is an issue connecting to MongoDB.
 */
const connectMongo = async () => {
    return await mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
}

export default connectMongo;
