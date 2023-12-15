import moment from "moment";
import { v4 as uuidv4 } from 'uuid';

import {validateId} from "../utils/validate-uuid.js";
import {validatePayload} from "../utils/validate-payload.js";
import {GetUserEmailsById} from "../services/prepBuddyServices.js";

// imports service layer functions
import * as mockInterviewService from "../services/mock-interviews-services.js";

// imports for calendar and drive API.
import {
    CreateCalendarEvent,
    DeleteCalenderEvent,
    UpdateCalendarEvent,
    uploadModifiedFileToGoogleDrive,
    uploadToGoogleDrive
} from "../utils/calender.js";


/**
 * Retrieves all mock interviews taken by a specific user based on the interviewer's ID and status filter.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters and query.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const GetMockInterviewsTaken = async (req, res) => {
    try {
        // userId validation as mandatory field
        validateId(req.params.userId, 'userId')

        // call to service layer.
        const mockInterviews = await mockInterviewService.GetMockInterviewsTaken({interviewedBy: req.params.userId, status: req.query.status});

        // format available slots format.
        mockInterviews?.map(interview => {
            interview?.availableSlots?.map(slot => {
                slot.start = moment(slot.start, 'YYYY-MM-DDTHH:mm').format('YYYY-MM-DDTHH:mm')
                slot.end = moment(slot.end, 'YYYY-MM-DDTHH:mm').format('YYYY-MM-DDTHH:mm')
            })
        })

        res.status(200).send(mockInterviews)
    } catch (e) {
        console.log(e);

        res.status(e.code ? e.code : 500).send({"message": e.message ? e.message : "Something went wrong."});
    }
}

/**
 * Retrieves all mock interviews requested by a user with a status filter.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters and query.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const GetMockInterviewsByFilter = async (req, res) => {
    try {
        validateId(req.params.userId, 'userId')

        // call to service layer with status filter and userId
        const mockInterviews = await mockInterviewService.GetMockInterviewsByFilter(req.params.userId, {status: req.query.status});

        // format available slots format.
        mockInterviews?.map(interview => {
            interview?.availableSlots?.map(slot => {
                slot.start = moment(slot.start, 'YYYY-MM-DDTHH:mm').format('YYYY-MM-DDTHH:mm')
                slot.end = moment(slot.end, 'YYYY-MM-DDTHH:mm').format('YYYY-MM-DDTHH:mm')
            })
        })

        res.status(200).send(mockInterviews)
    } catch (e) {
        console.log(e);

        res.status(e.code ? e.code : 400).send({"message": e.message ? e.message : "Something went wrong."});
    }
}

/**
 * Retrieves a mock interview by ID.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const GetMockInterviewByID = async (req, res) => {
    try {
        // validations for mandatory fields.
        validateId(req.params.userId, 'userId')
        validateId(req.params.mockInterviewId, 'mockInterviewId')

        // call to service layer with required params.
        const mockInterview = await mockInterviewService.GetMockInterviewByID(req.params.userId, req.params.mockInterviewId); // call to service layer.
        if (!mockInterview) { // validation for mock-interviews not exists with this userId.
            throw ({code: 404, message: `Entity not found with mock-interview id: ${req.params.mockInterviewId}`})
        }

        res.status(200).send(mockInterview)
    } catch (e) {
        console.log(e);

        res.status(e.code ? e.code : 500).send({"message": e.message ? e.message : "Something went wrong."});
    }

}

/**
 * Requests a new mock interview for a user with required details.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters, body, and files.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const RequestMockInterview = async (req, res) => {
    try {
        // mandatory fields validations
        validateId(req.params.userId, 'userId')
        validatePayload(req.body, ["title", "description", "company", "role", "availableSlots"])

        // TODO: validate resume in req.files

        // parse availableSlots from JSON string to list.
        req.body["availableSlots"] = JSON.parse(req.body.availableSlots)

        // format start & end date as required
        req.body.availableSlots.map(slot => {
            slot.id = uuidv4();
            slot.start = new Date(slot.start).getTime();
            slot.end = new Date(slot.end).getTime();
        })

        // call to uploadToGoogleDrive API when given a file
        const resume = await uploadToGoogleDrive(req.files.resumeFile)
        if(resume.status !== 200) { // validation if file is uploaded to google drive.
            throw ({code: resume.status, message: "Error uploading file to google drive."})
        }
        console.log("resume upload: ", resume.data.id)

        // pass resume id stored in Google Drive to mongoDB.
        req.body["resume"] = resume.data.id

        // call to service layer function with required params to store in DB.
        const mockInterview = await mockInterviewService.RequestMockInterview({id: uuidv4(), userId: req.params.userId, ...req.body});

        res.status(201).send(mockInterview);
    } catch (e) {
        console.log(e);

        res.status(e.code ? e.code : 500).send({"message": e.message ? e.message : "Something went wrong."});
    }
}

/**
 * Modifies a mock interview requested by a user.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters, body, and files.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const ModifyMockInterview = async (req, res) => {
    try {
        // mandatory fields validation
        validateId(req.params.userId, 'userId')
        validateId(req.params.mockInterviewId, 'mockInterviewId')

        validatePayload(req.body, ["title", "description", "company", "role", "availableSlots"])

        // TODO: validate resume in req.files

        // parse availableSlots from JSON string to list.
        req.body["availableSlots"] = JSON.parse(req.body.availableSlots)

        // If resume is updated then replace the existing file with new resume in the google drive.
        if(req.files) {
            const resume = await uploadModifiedFileToGoogleDrive(req.body.resume, req.files.resumeFile)
            if(resume.status !== 200) { // validation if resume is not uploaded successfully
                throw ({code: resume.status, message: "Error uploading file to google drive."})
            }
        }

        // call to service layer with with required params
        const mockInterview = await mockInterviewService.ModifyMockInterview(req.params.mockInterviewId, req.body);
        if (!mockInterview) {
            throw ({code: 404, message: `Entity doesn't exist with mock-interview id: ${req.params.mockInterviewId}`});
        }

        // TODO: validate availableSlots when updated.
        // Update the calendar event if scheduled for later and someone accepted it.
        const slots = mockInterview.availableSlots.filter(slot => slot.booked === true)
        if(slots.length > 0 && new Date(slots[0].start).getTime() > new Date().getTime() && mockInterview.status.toString() === "ACCEPTED") {
           if(mockInterview.eventId) {
               let endTime = new Date(slots[0].start)
               endTime.setHours(endTime.getHours() + 1)

               const emails = await GetUserEmailsById(mockInterview.userId, mockInterview.interviewedBy)

               // modify google calendar event with updated details.
               await UpdateCalendarEvent(mockInterview.eventId, mockInterview.title, mockInterview.description, slots[0].start, endTime, emails[0].email, emails[1].email)
           }
        }

        res.status(200).send(mockInterview)
    } catch (e) {
        console.log(e);

        res.status(e.code ? e.code : 500).send({"message": e.message ? e.message : "Something went wrong."});
    }
}

/**
 * Deletes a specific mock interview with the given ID.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const DeleteMockInterview = async (req, res) => {
    try {
        // mandatory fields validation
        validateId(req.params.userId, 'userId')
        validateId(req.params.mockInterviewId, 'mockInterviewId')

        // call to service layer to fetch mock-interview details from DB.
        const mockInterview = await mockInterviewService.GetMockInterviewByID(req.params.userId, req.params.mockInterviewId)
        if (!mockInterview) {
            throw ({code: 404, message: `mock-interview with id ${req.params.mockInterviewId} doesn't exists.`})
        }

        // call to service layer to delete a specific  mock-interview from DB.
        const deleteMockInterview = await mockInterviewService.DeleteMockInterview(req.params.mockInterviewId);
        if (deleteMockInterview.deletedCount === 0) {
            throw ({code: 404, message: `mock-interview with id ${req.params.mockInterviewId} doesn't exists.`})
        }

        // Cancel the calendar event if scheduled for later.
        const slots = mockInterview.availableSlots.filter(slot => slot.booked === true)
        if(slots.length > 0 && new Date(slots[0].start).getTime() > new Date().getTime() && mockInterview.status.toString() === "ACCEPTED") {
            if(mockInterview.eventId) {
                await DeleteCalenderEvent(mockInterview.eventId);
            }
        }

        res.status(204).send({})
    } catch (e) {
        console.log(e);

        res.status(e.code ? e.code : 500).send({"message": e.message ? e.message : "Something went wrong."});
    }
}

/**
 * Accepts a mock-interview requested by another user.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters, body.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const AcceptMockInterviewRequest = async (req, res) => {
    try {
        // mandatory fields validations
        validateId(req.params.interviewerId, 'userId')
        validateId(req.params.mockInterviewId, 'mockInterviewId')

        validatePayload(req.body, ["slotId", "resume"])

        // call to servive layer to update available slot booked by the interviewer.
        const mockInterview = await mockInterviewService.ModifyAvailableSlot(req.params.mockInterviewId, req.body.slotId, {interviewedBy: req.params.interviewerId,  status: 'ACCEPTED'});
        if (!mockInterview) {
            throw ({code: 404, message: `Entity doesn't exist with mock-interview id: ${req.params.mockInterviewId}`});
        }

        const emails = await GetUserEmailsById(mockInterview.userId, mockInterview.interviewedBy)

        // filter availableSlot which are booked to send an google calender event
        const slots = mockInterview.availableSlots.filter(slot => slot.booked === true)

        let updatedMockInterview;
        if(slots.length > 0) {
            // send a google calender event
            let eventId = await CreateCalendarEvent(mockInterview.title, mockInterview.description, slots[0].start, slots[0].end, emails[0].email, emails[1].email, req.body.resume)

            // Update google calender event id the DB for further modifications.
            updatedMockInterview = await mockInterviewService.ModifySpecificFields(req.params.mockInterviewId, {eventId: eventId.toString()});
            if (!updatedMockInterview) {
                throw ({code: 404, message: `Entity doesn't exist with mock-interview id: ${req.params.mockInterviewId}`});
            }
        }

        res.status(200).send(updatedMockInterview ? updatedMockInterview : mockInterview);
    } catch (e) {
        console.log(e);

        res.status(e.code ? e.code : 500).send({"message": e.message ? e.message : "Something went wrong."});
    }
}

/**
 * Modifies feedback on a mock-interview once accepted by that user.
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters, body.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const ModifyFeedback = async (req, res) => {
    try {
        // mandatory fields validation.
        validateId(req.params.interviewerId, 'userId')
        validateId(req.params.mockInterviewId, 'mockInterviewId')

        validatePayload(req.body, ["feedback"])

        // TODO: match interviewedBy in the DB.
        // call to service layer to update feedback in Db.
        const mockInterview = await mockInterviewService.ModifySpecificFields(req.params.mockInterviewId, {...req.body, feedbackAt: new Date().getTime(), status: 'COMPLETED'});
        if (!mockInterview) {
            throw ({code: 404, message: `Entity doesn't exist with mock-interview id: ${req.params.mockInterviewId}`});
        }

        res.status(200).send(mockInterview);
    } catch (e) {
        console.log(e);

        res.status(e.code ? e.code : 500).send({"message": e.message ? e.message : "Something went wrong."});
    }
}

/**
 * Fetches all Google Calendar events for a user (interviewer or interviewee).
 *
 * @async
 * @function
 * @param {Object} req - Express request object containing parameters.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise representing the asynchronous operation.
 */
export const GetUserEvents = async (req, res) => {
    try {
        // mandatory fields validation
        validateId(req.params.userId, 'userId')

        // call to service layer to fetch details from DB.
        const events = await mockInterviewService.GetUserEvents(req.params.userId)

        res.status(200).send(events);
    } catch (e) {
        console.log(e);
    }
}
