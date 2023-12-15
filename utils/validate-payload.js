/**
 * Validates the presence of required fields in a JSON payload.
 *
 * @param {object} data - The JSON data payload to be validated.
 * @param {string[]} fields - An array of required fields to check in the payload.
 * @returns {object} - An object containing a status code and a message indicating the validation result.
 * @throws {object} - Throws an object with a status code and a message if required fields are missing.
 */
export const validatePayload = (data, fields) => {
    if (fields.length === 0) {
        throw {code: 400, message: "No fields to check."}
    }

    for (let i = 0; i < fields.length; i++) {
        if (!data[fields[i]]) {
            throw {code: 400, message: `${fields[i]} is missing`}
        }
    }

    return {code: 200, message: "all required fields are in payload"}
}