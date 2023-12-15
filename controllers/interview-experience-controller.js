import  {v4 as uuidv4} from 'uuid';

// imports service layer functions
import * as interviewExperienceService from "../services/interview-experience-services.js";

/**
 * Retrieves all interview experiences.
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution.
 */
export const getAllInterviewExperience = async (req, res) => {
    try {
        const tasks = await interviewExperienceService.getAllInterviewExperience(); // call to service layer.

        setResponse(tasks, res, 200)
    } catch (err) {
        console.log(err)
        setError(err, res, 400)
    }
}

/**
 * Retrieves a specific interview experience by ID.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution.
 */
export const getInterviewExperience = async (req, res) => {
    let statusCode;

    try {
        const task = await interviewExperienceService.getInterviewExperience(req.params.experienceId);
        if (!task) {
            statusCode = 404;
            throw {"error": `task with id: ${req.params.experienceId} does not exist.`};
        }

        setResponse(task, res, 200)
    } catch (err) {
        setError(err, res, statusCode? statusCode : 400)
    }
}

/**
 * Creates a new interview experience for a user.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters and body.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution, such as an invalid future date.
 */
export const createInterviewExperience = async (req, res) => {
    try {
        if(new Date(req.body.interviewedDate) > new Date()) {
            throw {"error": `interviewedDate must be in the past!!!`};
        }

        const saveTask = await interviewExperienceService.createInterviewExperience(req.params.userId, {...req.body, id: uuidv4()});

        setResponse(saveTask, res, 201)
    } catch (err) {

        console.log("create error: ", err)

        setError(err, res, 400);
    }
}

/**
 * Updates an existing interview experience by ID.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters and body.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution, such as an invalid future date or non-existent entity.
 */
export const updateInterviewExperience = async (req, res) => {
    let statusCode;
    try {

        if(new Date(req.body.interviewedDate) > new Date()) {
            throw {"error": `interviewedDate must be in the past!!!`};
        }

        const saveTask = await interviewExperienceService.updateInterviewExperience(req.params.experienceId, req.body);
        if (!saveTask) {
            statusCode = 404;
            throw {"error": `Entity doesn't exist with task id: ${req.params.experienceId}` };
        }

        setResponse(saveTask, res, 200)
    } catch (err) {
        setError(err, res, statusCode? statusCode: 400)
    }
}

/**
 * Deletes an interview experience for a user by ID.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution, such as the entity not existing.
 */
export const deleteInterviewExperience = async (req, res) => {
    let statusCode;
    try {
        const deleteTask = await interviewExperienceService.deleteInterviewExperience(req.params.userId, req.params.experienceId);
        if (deleteTask.deletedCount === 0) {
            statusCode = 404;
            throw {"error": `task with id: ${req.params.experienceId} doesnt not exists.`};
        }

        setResponse(deleteTask, res, 204)
    } catch (err) {
        setError(err, res, statusCode? statusCode: 400)
    }
}

/**
 * Retrieves all comments for a specific interview experience.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution, such as a general error message.
 */
export const getAllInterviewExperienceComment = async(req, res) => {
    try {
        const allComments = await interviewExperienceService.getAllInterviewExperienceComment(req.params.experienceId);
        
        res.status(200).send(allComments)
    } catch (error) {
        res.status(400).send({"message": "Something went wrong!!"})
    }
}

/**
 * Creates a new comment for a specific interview experience.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters and body.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution, such as a general error message.
 */
export const createInterviewExperienceComment = async (req, res) => {
    try {   
        const saveTask = await interviewExperienceService.createInterviewExperienceComment(req.params.experienceId, {...req.body, userId: req.params.userId, id: uuidv4()});
        setResponse(saveTask, res, 201)
    } catch (err) {

        console.log("comment error: ", err)
        setError(err, res, 400);
    }
}


/**
 * Updates a comment for a specific interview experience by experienceId and commentId.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters and body.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution, such as a non-existent entity.
 */
export const updateInterviewExperienceComment = async (req, res) => {
    let statusCode;
    try {
        const saveTask = await interviewExperienceService.updateInterviewExperienceComment(req.params.userId, req.params.experienceId, req.params.commentId, req.body.comment);
        if (!saveTask) {
            statusCode = 404;
            throw {"error": `Entity doesn't exist with task id: ${req.params.commentId}` };
        }

        setResponse(saveTask, res, 200)
    } catch (err) {
        setError(err, res, statusCode? statusCode: 400)
    }
}

/**
 * Deletes a comment for a specific interview experience by experienceId and commentId.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution, such as a non-existent entity.
 */
export const deleteInterviewExperienceComment = async (req, res) => {
    let statusCode;
    try {

        const deleteTask = await interviewExperienceService.deleteInterviewExperienceComment(req.params.userId, req.params.experienceId, req.params.commentId);
        const comments = deleteTask ? deleteTask.comments.filter(comment => comment.id === req.params.commentId) : []
        if (comments.length > 0) {
            statusCode = 404;
            throw {"error": `task with id: ${req.params.commentId} doesnt not exists.`};
        }

        setResponse(deleteTask, res, 204)
    } catch (err) {
        setError(err, res, statusCode? statusCode: 400)
    }
}

/**
 * Updates upvotes for a specific interview experience by experienceId.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters and body.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 * @throws {Object} - Error object if there's an issue during the execution, such as a non-existent entity.
 */
export const upvotesInterviewExperience = async (req, res) => {
    let statusCode;
    try {
        const saveTask = await interviewExperienceService.upvotesInterviewExperience(req.params.userId,req.params.experienceId, req.body.upvotes);
        if (!saveTask) {
            statusCode = 404;
            throw {"error": `Entity doesn't exist with task id: ${req.params.experienceId}` };
        }

        setResponse(saveTask, res, 200)
    } catch (err) {
        setError(err, res, statusCode? statusCode: 400)
    }
}


/**
 * Sets the HTTP response status and JSON body for each request.
 *
 * @function
 * @param {Object} obj - Object to be sent in the response body.
 * @param {Object} responses - Express response object.
 * @param {number} statusCode - HTTP status code to be set in the response.
 */
const setResponse = (obj, responses, statusCode) => {
    responses.status(statusCode);
    responses.json(obj);
}

/**
 * Sets the HTTP response status and JSON body in case of failure for each request.
 *
 * @function
 * @param {Object} err - Error object to be sent in the response body.
 * @param {Object} responses - Express response object.
 * @param {number} statusCode - HTTP status code to be set in the response.
 */
const setError = (err, responses, statusCode) => {
    responses.status(statusCode);
    responses.json(err);
}