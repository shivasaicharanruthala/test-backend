import * as contactsService from '../services/todo-service.js'

/**
 * Sets an error response with status code and JSON body for a given Express response object.
 *
 * @function
 * @param {Object} error - Error object to be sent in the response body.
 * @param {Object} response - Express response object.
 * @param {number} statusCode - HTTP status code to be set in the response.
 * @returns {void}
 */
const setErrorResponse=(error, response, statusCode) =>{ //this is for success response
    console.log(statusCode)
    response.status(statusCode);
    response.json(error);
}

/**
 * Sets a success response with status code and JSON body for a given Express response object.
 *
 * @function
 * @param {Object} obj - Object to be sent in the response body.
 * @param {Object} response - Express response object.
 * @param {number} statusCode - HTTP status code to be set in the response.
 * @returns {void}
 */
const setSuccessResponse=(obj, response, statusCode) =>{ //this is for success response
    response.status(statusCode);
    response.json(obj)
}

/**
 * Handles the creation of a new contact record.
 *
 * @async
 * @function
 * @param {Object} request - Express request object containing the payload in the body.
 * @param {Object} response - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const post=async(request, response) => {
    let statusCode;
    try{
    const payload=request.body;
    console.log("the payload", request)
    const contact= await contactsService.save(payload);
    statusCode=201;
    setSuccessResponse(contact,response, statusCode);
    }
    catch(error){
        setErrorResponse(error,response, statusCode? statusCode: 400);
    }
}

/**
 * Handles the retrieval of contact records based on query parameters.
 *
 * @async
 * @function
 * @param {Object} request - Express request object containing query parameters.
 * @param {Object} response - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const index= async(request, response) => {
    //let statusCode;
    try{
        const jobTitle=request.query.jobTitle;
        const company=request.query.company;
        const jobLink = request.query.jobLink;
        const jobType = request.query.jobType;
        const query={};
        if(jobTitle){
            query.jobTitle=jobTitle;
          
        }
        if(company){
            query.company=company;
        }
        if(jobLink){
            query.jobLink = jobLink;
        }
        if(jobType){
            query.jobType = jobType;
        }
        const contacts=await contactsService.search(query);
        console.log("Log in details ------", contacts)
        setSuccessResponse(contacts,response, 200);
    }
    catch(error){
        setErrorResponse(error,response, 400);
    }
}

/**
 * Handles the retrieval of a contact record by ID.
 *
 * @async
 * @function
 * @param {Object} request - Express request object containing parameters.
 * @param {Object} response - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const get = async(request,response) =>{
    let statusCode;

    try{
        const id=request.params.id; //This id is from the URL
        console.log("id: ", id)
        const contact=await contactsService.get(id);
        
        if (!contact) {
            statusCode = 404;
            throw {"error": `task with id: ${id} does not exist.`};
        }
        statusCode=200;
        setSuccessResponse(contact,response, statusCode);
    }
    catch(error){
        setErrorResponse(error,response, statusCode? statusCode: 400);
    }
}

/**
 * Handles the update of a contact record by ID.
 *
 * @async
 * @function
 * @param {Object} request - Express request object containing parameters and body.
 * @param {Object} response - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const update = async(request,response) =>{
    let statusCode;
    try{
        const id=request.params.id;
        const updated={...request.body}; 
        console.log("the updated",request)//cloning it
        updated.id=id;
        const contact=await contactsService.update(updated);
        setSuccessResponse(contact, response,200)
    }
    catch(error){
        setErrorResponse(error,response,statusCode? statusCode: 400);  
    }
}

/**
 * Handles the removal of a contact record by ID.
 *
 * @async
 * @function
 * @param {Object} request - Express request object containing parameters.
 * @param {Object} response - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const remove = async(request,response) =>{
    try{
        const id=request.params.id; //params gives the parameters
        const contact=await contactsService.remove(id);
        setSuccessResponse({message: `Succesfully Removed ${id}`},response,204); //passing the message and response object
    }
    catch(error){
        setErrorResponse(error,response, 400);
    }
}

