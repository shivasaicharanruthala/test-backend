import InterviewExperience from "../models/interview-experience-models.js";

/**
 * Creates a new Interview Experience for a user.
 *
 * @param {string} userId - The ID of the user for whom the interview experience is being created.
 * @param {object} interview - The details of the interview experience.
 * @returns {Promise<object>} - A promise that resolves to the saved interview experience.
 * @throws {Error} - Throws an error if there is an issue during the creation process.
 */
export const createInterviewExperience = async (userId, interview) => {
   try {
    let newInterviewExperience = {...interview, "userId": userId};
    const newInterview = new InterviewExperience(newInterviewExperience);

    return newInterview.save();
   } catch (error) {
        console.log(error)
   }
}

/**
 * Retrieves an Interview Experience by its ID.
 *
 * @param {string} id - The ID of the interview experience to be retrieved.
 * @returns {Promise<object|null>} - A promise that resolves to the interview experience or null if not found.
 */
export const getInterviewExperience = async (id) => {
    return await InterviewExperience.findOne({"id": id}).exec();
}

/**
 * Retrieves all Interview Experiences with additional user details.
 *
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of interview experiences with extended user details.
 */
export const getAllInterviewExperience = async () => {
    return await InterviewExperience.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: 'id',
                pipeline: [
                    {$project: {"_id": 0, firstName: 1, lastName: 1}}
                ],
                as: 'users'
            }
        },
        {
            $unwind: "$users"
        } ,
        {
            $project: {
                "_id": 0,
                "id": 1,
                "userId": 1,
                "name": {$concat: ["$users.firstName", " ", "$users.lastName"]},
                "title": 1,
                "company": 1,
                "interviewedDate":1,
                "applicationProcess":1,
                "interviewProcess":1,
                "interviewExperience":1,
                "upvotes":1,
                "tags": 1,
                "comments":1
            }
        }
    ]).exec();
}


/**
 * Updates an existing Interview Experience by its ID.
 *
 * @param {string} id - The ID of the interview experience to be updated.
 * @param {object} interview - The updated details for the interview experience.
 * @returns {Promise<object|null>} - A promise that resolves to the updated interview experience or null if not found.
 */
export const updateInterviewExperience = async (id, interview) => {
    let updateInterviewExperience = {"title": interview.title, "company": interview.company, "interviewedDate": interview.interviewedDate,
    "applicationProcess": interview.applicationProcess, "interviewProcess": interview.interviewProcess, "interviewExperience": interview.interviewExperience, "tags": interview.tags};

    return await InterviewExperience.findOneAndUpdate({"id": id}, updateInterviewExperience, {new: true}).exec();
}

/**
 * Deletes an existing Interview Experience by its ID and user ID.
 *
 * @param {string} userId - The ID of the user who owns the interview experience.
 * @param {string} experienceId - The ID of the interview experience to be deleted.
 * @returns {Promise<object>} - A promise that resolves to the deletion result.
 */
export const deleteInterviewExperience = async (userId, experienceId) => {
    return await InterviewExperience.deleteOne({ id: experienceId,  userId: userId}).exec();
}

/**
 * Retrieves all comments for a specific Interview Experience.
 *
 * @param {string} experienceId - The ID of the interview experience for which comments are retrieved.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of comments for the interview experience.
 */
export const getAllInterviewExperienceComment = async (experienceId) => {
    return await InterviewExperience.find({id: experienceId}).sort({interviewedDate: -1}).exec()
}

/**
 * Creates a new comment for a specific Interview Experience.
 *
 * @param {string} experienceId - The ID of the interview experience to which the comment is added.
 * @param {object} comment - The details of the comment.
 * @returns {Promise<object|null>} - A promise that resolves to the updated interview experience or null if not found.
 */
export const createInterviewExperienceComment = async (experienceId, comment) => {
    return await InterviewExperience.findOneAndUpdate({id: experienceId}, { "$push":
    {"comments":
        {
            "id": comment.id,
            "userId": comment.userId,
            "comment": comment.comment
        }
    }
}, {new: true}).exec();
}

/**
 * Modifies the existing Interview Experience Comment by its ID.
 *
 * @param {string} userId - The ID of the user who owns the comment.
 * @param {string} experienceId - The ID of the interview experience to which the comment belongs.
 * @param {string} commentId - The ID of the comment to be updated.
 * @param {object} comment - The updated details for the comment.
 * @returns {Promise<object|null>} - A promise that resolves to the updated interview experience or null if not found.
 */
export const updateInterviewExperienceComment = async (userId, experienceId, commentId, comment) => {
    return await InterviewExperience.findOneAndUpdate(
        {id: experienceId},
        {
            $set: {
                "comments.$[inner].comment": comment
            }
        },
        {
            arrayFilters: [{"inner.id" : commentId, "inner.userId": userId}],
            new: true
        }
    ).exec();
}

/**
 * Deletes a specific Interview Experience Comment.
 *
 * @param {string} userId - The ID of the user who owns the comment.
 * @param {string} experienceId - The ID of the interview experience to which the comment belongs.
 * @param {string} commentId - The ID of the comment to be deleted.
 * @returns {Promise<object|null>} - A promise that resolves to the updated interview experience or null if not found.
 */
export const deleteInterviewExperienceComment = async (userId, experienceId, commentId) => {
    return await InterviewExperience.findOneAndUpdate(
        {id: experienceId},
        { $pull: { comments: { id: commentId, userId:  userId} }}, {new: true}
        ).exec();
}

/**
 * Updates the upvotes/downvotes in an Interview Experience card.
 *
 * @param {string} userId - The ID of the user performing the upvote/downvote.
 * @param {string} experienceId - The ID of the interview experience to be upvoted/downvoted.
 * @param {boolean} increment - A boolean indicating whether to increment (true) or decrement (false) the upvotes.
 * @returns {Promise<object|null>} - A promise that resolves to the updated interview experience or null if not found.
 */
export const upvotesInterviewExperience = async (userId, experienceId, increment) => {
    return await InterviewExperience.findOneAndUpdate(
        {id: experienceId, userId: {$ne: userId}},
        { $inc: { upvotes:  increment ? 1 : -1} }, {new: true}
        ).exec();
}
