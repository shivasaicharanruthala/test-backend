// imports mock-interviews schema
import MockInterview from "../models/mock-interviews.models.js";

/**
 * Fetches all the mock interviews specific to a user ID and optional status filter.
 *
 * @param {string} userId - The ID of the user for whom mock interviews are fetched.
 * @param {object} filter - An optional filter object containing a "status" property.
 * @param {string} filter.status - Optional status filter for mock interviews.
 * @returns {Promise<Array>} - A promise that resolves to an array of mock interviews.
 */
export const GetMockInterviewsByFilter = async (userId, filter) => {
    let search = {}
    if (filter && filter.status) {
        search["status"] = filter.status
    }

    search["userId"] = userId

    return await GetMockInterviewsAggregate(search)
}

/**
 * Fetches a mock interview by its ID for a specific user.
 *
 * @param {string} userId - The ID of the user for whom the mock interview is fetched.
 * @param {string} mockInterviewId - The ID of the mock interview to be fetched.
 * @returns {Promise<object|null>} - A promise that resolves to the mock interview or null if not found.
 */
export const GetMockInterviewByID = async (userId, mockInterviewId) => {
    return MockInterview.findOne({userID: userId, mockInterviewId: mockInterviewId}).exec();
}

/**
 * Saves mock interview details requested in the database.
 *
 * @param {object} payload - The details of the mock interview to be saved.
 * @returns {Promise<object>} - A promise that resolves to the saved mock interview details.
 */
export const RequestMockInterview = async (payload) => {
    const newMockInterview = new MockInterview(payload);

    return newMockInterview.save();
}

/**
 * Updates existing mock interview details for a specific interview ID.
 *
 * @param {string} mockInterviewId - The ID of the mock interview to be modified.
 * @param {object} payload - The updated details for the mock interview.
 * @returns {Promise<object|null>} - A promise that resolves to the updated mock interview or null if not found.
 */
export const ModifyMockInterview = async (mockInterviewId, payload) => {
    let updateMockInterview = {
        "title": payload.title,
        "description": payload.description,
        "company": payload.company,
        "role": payload.role,
        "availableSlots": payload.availableSlots
    };

    return await MockInterview.findOneAndUpdate({"id": mockInterviewId}, updateMockInterview, {new: true}).exec();
}

/**
 * Deletes an existing mock interview for a given interview ID.
 *
 * @param {string} id - The ID of the mock interview to be deleted.
 * @returns {Promise<object>} - A promise that resolves to the deletion result.
 */
export const DeleteMockInterview = async (id) => {
    // TODO: validate user to be deleted.
    return await MockInterview.deleteOne({"id": id}).exec();
}

/**
 * Fetches all mock interviews based on a status filter or interviewedBy.
 *
 * @param {object} filter - An optional filter object containing "status" and "interviewedBy" properties.
 * @param {string} filter.status - Optional status filter for mock interviews.
 * @param {string} filter.interviewedBy - Optional user ID of the interviewer.
 * @returns {Promise<Array>} - A promise that resolves to an array of mock interviews.
 */
export const GetMockInterviewsTaken = async (filter) => {
    let search = {}
    if (filter && filter.status && filter.status === "REQUESTED") {
        search["status"] = filter.status
    } else {
        if (filter && filter.interviewedBy) {
            search["interviewedBy"] = filter.interviewedBy
        }

        if (filter && filter.status) {
            search["status"] = filter.status
        }
    }

    // aggregator to fetch user and interviewer details from user collection.
    return await GetMockInterviewsAggregate(search)
}

/**
 * Joins mock interview collection with user collection and projects required fields based on the given search criteria.
 *
 * @param {object} search - The search criteria to match mock interviews.
 * @returns {Promise<Array>} - A promise that resolves to an array of aggregated mock interviews.
 */
export const GetMockInterviewsAggregate = async (search) => {
    return await MockInterview.aggregate([
        {$match: {...search}},
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: 'id',
                pipeline: [
                    {$project: {"_id": 0, "id": 1, "firstName": 1}}
                ],
                as: 'user'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'interviewedBy',
                foreignField: 'id',
                pipeline: [
                    {$project: {"_id": 0, "id": 1, "firstName": 1}}
                ],
                as: 'interviewer'
            }
        }
    ]).exec()
}

/**
 * Modifies specific fields of a document when a given mock interview ID is matched and returns the updated fields.
 *
 * @param {string} mockInterviewId - The ID of the mock interview document to be modified.
 * @param {object} payload - The fields to be modified and their new values.
 * @returns {Promise<object|null>} - A promise that resolves to the updated mock interview fields or null if not found.
 */
export const ModifySpecificFields = async (mockInterviewId, payload) => {
    return await MockInterview.findOneAndUpdate({id: mockInterviewId}, {"$set": {...payload}}, {new: true}).exec();
}

/**
 * Modifies available slots of a document when a given mock interview ID and slot ID are matched and returns updated fields.
 *
 * @param {string} mockInterviewId - The ID of the mock interview document to be modified.
 * @param {string} slotId - The ID of the available slot to be modified.
 * @param {object} payload - The fields to be modified and their new values.
 * @returns {Promise<object|null>} - A promise that resolves to the updated mock interview fields or null if not found.
 */
export const ModifyAvailableSlot = async (mockInterviewId, slotId, payload) => {
    return await MockInterview.findOneAndUpdate({id: mockInterviewId},
        {
            "$set": {
                "interviewedBy": payload.interviewedBy,
                "status": payload.status,
                "availableSlots.$[outer].booked": true,
            }
        },
        {
            new: true,
            arrayFilters: [
                {"outer.id": slotId},
            ]
        }).exec()
}

/**
 * Fetches all user events (mock interviews) with required status for a specific user ID.
 *
 * @param {string} userId - The ID of the user for whom events are fetched.
 * @returns {Promise<Array>} - A promise that resolves to an array of user events with required status.
 */
export const GetUserEvents = async (userId) => {
    return await MockInterview.aggregate([
        {
            $match: {
                $or: [{status: 'COMPLETED'}, {status: 'ACCEPTED'}], $and: [{
                    $or: [
                        {userId: userId},
                        {interviewedBy: userId}
                    ]
                }]
            }
        },
        {
            $project: {
                "_id": 0, "title": 1, "status": 1, "userId": 1,
                "availableSlots": {
                    $filter: {
                        input: "$availableSlots",
                        as: "slot",
                        cond: {
                            $eq: ["$$slot.booked", true]
                        }
                    }
                }
            }
        },
        {$unwind: "$availableSlots"},
        {
            $project: {
                "title": 1, "status": 1,
                "start": "$availableSlots.end",
                "end": "$availableSlots.end",
            }
        },
    ]).exec()
}
