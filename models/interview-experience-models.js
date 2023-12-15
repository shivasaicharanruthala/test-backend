import mongoose from 'mongoose';


/**
 * Mongoose schema for comments associated with an interview experience.
 * Each comment has an 'id', 'userId', and 'comment'.
 *
 * @typedef {Object} CommentsSchema
 * @property {String} id - Unique identifier for the comment.
 * @property {String} userId - Identifier of the user who posted the comment.
 * @property {String} comment - The content of the comment.
 */
const commentsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: 'id field is required'
    },
    userId: {
        type: String,
        required: 'userId field is required'
    },
    comment: {
        type: String,
        required: 'title field is required'
    },
})

/**
 * Mongoose schema for interview experiences.
 * Each experience has an 'id', 'userId', 'title', 'company', 'tags', 'interviewedDate',
 * 'applicationProcess', 'interviewProcess', 'interviewExperience', 'upvotes', and 'comments'.
 * The 'comments' field is an array of CommentsSchema.
 *
 * @typedef {Object} InterviewExperienceSchema
 * @property {String} id - Unique identifier for the interview experience.
 * @property {String} userId - Identifier of the user who shared the experience.
 * @property {String} title - Title of the interview experience.
 * @property {String} company - Company where the interview took place.
 * @property {String} tags - Tags associated with the interview experience.
 * @property {Date} interviewedDate - Date when the interview took place.
 * @property {String} applicationProcess - Description of the application process.
 * @property {String} interviewProcess - Description of the interview process.
 * @property {String} interviewExperience - Detailed description of the interview experience.
 * @property {Number} upvotes - Number of upvotes received for the interview experience.
 * @property {Array<CommentsSchema>} comments - Array of comments associated with the interview experience.
 * @property {Object} timestamps - Auto-generated timestamps for 'createdAt' and 'updatedAt'.
 */
const interview_experience_schema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: 'id field is required'
    },
    userId: {
        type: String,
        required: 'userId field is required'
    },
    title: {
        type: String,
        required: 'title field is required'
    },
    company: {
        type: String,
        required: 'title field is required'
    },
    tags: {
        type: String,
        required: 'tags field is required'
    },
    interviewedDate: {
        type: Date,
        default: Date.now(),
        required: 'interviewedDate field is required'
    },
    applicationProcess: {
        type: String,
        required: 'applicationProcess field is required'
    },
    interviewProcess: {
        type: String,
        required: 'interviewProcess field is required'
    },
    interviewExperience: {
        type: String,
        required: 'interviewExperience field is required'
    },
    upvotes: {
        type: Number,
        default: 0
    },
    comments: {
        type: [commentsSchema],
    }
}, {timestamps: true})


const interview_experience_model = mongoose.model('interview-experiences', interview_experience_schema);

export default interview_experience_model;