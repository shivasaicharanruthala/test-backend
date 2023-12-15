import Todo from '../models/job-listing.js'

/**
 * Saves a new contact to the database.
 *
 * @param {object} newContact - Object containing contact details like jobTitle, company, jobLink, jobType.
 * @returns {Promise<object>} - A promise that resolves to the saved contact object.
 */
export const save = (newContact) =>{ //Business logic
    const contact = new Todo();
    contact.jobTitle= newContact.jobTitle;
    contact.company= newContact.company;
    contact.jobLink = newContact.jobLink;
    contact.jobType = newContact.jobType;
    // contact.dueDate= newContact.todoDate;
    // contact.dueTime= newContact.todoTime;
    return contact.save(); //model which is saving
}

/**
 * Searches for contacts in the database based on the provided query parameters.
 *
 * @param {object} query - Object containing search parameters.
 * @returns {Promise<Array>} - A promise that resolves to an array of contacts that match the search criteria.
 */
export const search = (query) =>{ //Request params
    const params= {...query};
    return Todo.find(params).exec(); //mo //model which is saving
}

/**
 * Gets a contact from the database by its ID.
 *
 * @param {string} id - The ID of the contact to retrieve.
 * @returns {Promise<object|null>} - A promise that resolves to the contact object or null if not found.
 */
export const get= (id) =>{
    const contact= Todo.findById(id).exec(); //This is mongo's ID
    return contact;
}

/**
 * Updates an existing contact in the database.
 *
 * @param {object} updatedContact - Object containing updated contact details, including the contact ID.
 * @returns {Promise<object|null>} - A promise that resolves to the updated contact object or null if not found.
 */
export const update = (updatedContact) =>{
    //updatedContact.modifiedTime=new Date();
    const contact=Todo.findByIdAndUpdate(updatedContact.id,updatedContact).exec(); //this won't invoke the promise
    return contact;
}

/**
 * Removes a contact from the database by its ID.
 *
 * @param {string} id - The ID of the contact to be removed.
 * @returns {Promise<object|null>} - A promise that resolves to the removed contact object or null if not found.
 */
export const remove=(id) => {
    const contact=Todo.findByIdAndDelete(id).exec();
    return contact;
}
