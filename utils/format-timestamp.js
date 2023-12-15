/**
 * Formats a timestamp by adding 5 hours to the provided date.
 *
 * @param {Date} date - The date object representing the timestamp to be formatted.
 * @returns {Date} - The formatted date object.
 */
export const formatTimeStamp = (date) => {
    const d = new Date(date)
    d.setHours(d.getHours() + 5)

    return d
}