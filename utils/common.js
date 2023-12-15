/**
 * Sets the HTTP response status and sends a JSON object in the response.
 *
 * @param {Object} obj - The object to be sent in the response.
 * @param {Object} responses - The HTTP response object.
 * @param {Number} statusCode - The HTTP status code to be set in the response.
 */
export const setResponse = (obj, responses, statusCode) => {
    responses.status(statusCode);
    responses.json(obj);
}

/**
 * Sets the HTTP response status, sends a JSON error object in the response, and specifies the status code.
 *
 * @param {Object} err - The error object to be sent in the response.
 * @param {Object} responses - The HTTP response object.
 * @param {Number} statusCode - The HTTP status code to be set in the response.
 */
export const setError = (err, responses, statusCode) => {
    responses.status(statusCode);
    responses.json(err);
}
