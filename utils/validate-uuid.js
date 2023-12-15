import { validate as uuidValidate } from 'uuid';

/**
 * Validates if the provided ID adheres to the UUID format.
 *
 * @param {string} id - The ID to be validated.
 * @param {string} param - The name or description of the parameter associated with the ID.
 * @returns {undefined} - No return value; throws an exception if the ID is invalid.
 * @throws {object} - Throws an object with a status code and a message if the ID is invalid.
 */
export const validateId = (id, param) => {
    if(!uuidValidate(id)) {
        throw ({code: 400, message: `Invalid param ${param}: ${id}`})
    }
}