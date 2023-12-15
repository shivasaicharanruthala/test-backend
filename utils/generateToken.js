import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config({path: '../.env'});

/**
 * Generates a JSON Web Token (JWT) using the provided user identifier.
 *
 * @param {string} id - The user identifier used to create the token.
 * @returns {string} - The generated JWT.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export default generateToken;