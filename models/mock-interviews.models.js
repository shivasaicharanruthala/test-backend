import mongoose from 'mongoose';

/**
 * Mongoose schema for available slots in a mock interview.
 *
 * @typedef {Object} AvailableSlotsSchema
 * @property {String} id - Unique identifier for the available slot.
 * @property {Date} start - Start time of the available slot.
 * @property {Date} end - End time of the available slot.
 * @property {Boolean} booked - Indicates if the slot is booked or not.
 */

/**
 * Mongoose schema for mock interviews.
 *
 * @typedef {Object} MockInterviewSchema
 * @property {String} id - Unique identifier for the mock interview.
 * @property {String} userId - User ID associated with the mock interview.
 * @property {String} interviewedBy - User ID of the interviewer (optional).
 * @property {String} title - Title of the mock interview.
 * @property {String} company - Company associated with the mock interview.
 * @property {String} role - Role for which the mock interview is conducted.
 * @property {String} description - Description of the mock interview.
 * @property {String} resume - ID or link to the resume associated with the interviewee.
 * @property {AvailableSlotsSchema[]} availableSlots - Array of available slots for the mock interview.
 * @property {String} status - Status of the mock interview (REQUESTED, INACTIVE, ACCEPTED, COMPLETED).
 * @property {String} feedback - Feedback for the mock interview (optional).
 * @property {Date} feedbackAt - Timestamp for when feedback is provided (optional).
 * @property {String} eventId - ID associated with the Google Calendar event (optional).
 * @property {Object} timestamps - Auto-generated timestamps for 'createdAt' and 'updatedAt'.
 */

/**
 * Mongoose schema definition for mock interview documents.
 *
 * @type {mongoose.Schema}
 */
const AvailableSlotsSchema = new mongoose.Schema({
    id: {
      type: String,
        unique: true,
        required: 'id field is required'
    },
    start: {
        type: Date,
        required: 'start time field is required'
    },
    end: {
        type: Date,
        required: 'end time field is required'
    },
    booked: {
        type: Boolean,
        default: false
    }
})

// mongoose schema for mock-interviews
const schema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: 'id field is required'
    },
    userId: {
        type: String,
        required: 'userId field is required'
    },
    interviewedBy: {
        type: String,
    },
    title: {
        type: String,
        required: 'title field is required'
    },
    company: {
        type: String,
        required: 'company field is required'
    },
    role: {
        type: String,
        required: 'role field is required'
    },
    description: {
        type: String,
        required: 'description field is required'
    },
    resume: {
        type: String,
        required: 'resume field is required'
    },
    availableSlots: {
        type: [AvailableSlotsSchema],
        required: 'availableSlots field is required'
    },
    status: {
        type: String,
        default: 'REQUESTED',
        enum : ['REQUESTED', 'INACTIVE', 'ACCEPTED', 'COMPLETED'],
        required: 'status field is required'
    },
    feedback: {
        type: String,
    },
    feedbackAt: {
        type: Date,
    },
    eventId: {
        type: String,
    }
}, {timestamps: true})


const model = mongoose.model('mockinterviews', schema);

export default model; // export mock-interviews schema.
