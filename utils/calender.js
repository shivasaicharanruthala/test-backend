// Require google from googleapis package.
import * as dotenv from 'dotenv';
import {google} from 'googleapis';
import { Readable } from 'stream'
import {v4 as uuidv4} from 'uuid';

dotenv.config({path: '../.env'}) // set up .env config

// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth

/**
 * Creates an object representing a Google Calendar event.
 *
 * @param {String} title - The title of the event.
 * @param {String} description - The description of the event.
 * @param {String} startTime - The start time of the event.
 * @param {String} endTime - The end time of the event.
 * @param {String} interviewerEmail - Email of the interviewer.
 * @param {String} intervieweeEmail - Email of the interviewee.
 * @param {String} resumeId - ID of the resume associated with the event.
 * @returns {Object} - Object representing a Google Calendar event.
 */

const createEventObj = (title, description, startTime, endTime, interviewerEmail, intervieweeEmail, resumeId) => {
    return  {
        summary: title,
        description: description,
        colorId: 1,
        start: {
            dateTime: startTime,
            timeZone: 'America/New_York',
        },
        end: {
            dateTime:  endTime,
            timeZone: 'America/New_York',
        },
        attendees: [
            {'email': interviewerEmail},
            {'email': intervieweeEmail},
        ],
        reminders: {
            'useDefault': false,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
            ],
        },
        conferenceData: {
            createRequest: {
                conferenceSolutionKey: {type: 'hangoutsMeet'},
                requestId: uuidv4(),
            },
        },
        attachments: [
            {
                eventAttachment: {
                    mimeType: "application/pdf",
                    title: "resume",
                    fileUrl: `https://drive.google.com/file/d/${resumeId}/view?usp=drivesdk`,
                }
            }
        ]
    };
}

/**
 * Creates a Google Calendar event and returns the event ID.
 *
 * @param {String} title - The title of the event.
 * @param {String} description - The description of the event.
 * @param {String} startTime - The start time of the event.
 * @param {String} endTime - The end time of the event.
 * @param {String} interviewerEmail - Email of the interviewer.
 * @param {String} intervieweeEmail - Email of the interviewee.
 * @param {String} resumeId - ID of the resume associated with the event.
 * @returns {String} - Event ID of the created Google Calendar event.
 */
export const CreateCalendarEvent = async (title, description, startTime, endTime, interviewerEmail, intervieweeEmail, resumeId) => {
   try {
       const oAuth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET)

       // OAuth2 client for Google calendar
       oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

       // google calender service obj
       const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

       // calender event object
       const event = createEventObj(title, description, startTime, endTime, interviewerEmail, intervieweeEmail, resumeId)

       // insert event
       let eventDetails = await calendar.events.insert({ auth: oAuth2Client, calendarId: "primary", resource: event, conferenceDataVersion: 1,})

       return eventDetails.data.id
   } catch (err) {
        console.log(err)

       return ''
   }
}

/**
 * Updates an existing Google Calendar event.
 *
 * @param {String} eventId - ID of the event to be updated.
 * @param {String} title - The title of the event.
 * @param {String} description - The description of the event.
 * @param {String} startTime - The start time of the event.
 * @param {String} endTime - The end time of the event.
 * @param {String} interviewerEmail - Email of the interviewer.
 * @param {String} intervieweeEmail - Email of the interviewee.
 * @returns {String} - Event ID of the updated Google Calendar event.
 */
export const UpdateCalendarEvent = async (eventId, title, description, startTime, endTime, interviewerEmail, intervieweeEmail) => {
    try {
        const oAuth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET)

        // OAuth2 client for Google calendar
        oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

        // google calender service obj
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

        // calender event object
        const eventObj = createEventObj(title, description, startTime, endTime, interviewerEmail, intervieweeEmail)

        // update event
        const updatedEvent = await calendar.events.update({ auth: oAuth2Client, calendarId: "primary", resource: eventObj, eventId: eventId})

        return updatedEvent.data.id
    } catch (err) {
        console.log(err)
    }
}

/**
 * Deletes a Google Calendar event given the event ID.
 *
 * @param {String} eventId - ID of the event to be deleted.
 * @returns {Number} - Returns 1 if the event is deleted successfully, otherwise 0.
 */
export const DeleteCalenderEvent = async (eventId) => {
    try {
        const oAuth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET)

        // OAuth2 client for Google calendar
        oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

        // google calender service obj
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

        // delete event
        let response = await calendar.events.delete({auth: oAuth2Client, calendarId: "primary", eventId: eventId});
        if (response.data === '') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(`Error deleting event: `, error);
        return 0;
    }
};

/**
 * Uploads a file to Google Drive and returns the file ID.
 *
 * @param {Object} file - The file to be uploaded, containing name, mimetype, and data.
 * @returns {Object} - Object containing the file ID.
 */
export const uploadToGoogleDrive = async (file) => {
    const oAuth2Client = new OAuth2(process.env.CLIENT_ID_DRIVE, process.env.CLIENT_SECRET_DRIVE)

    // OAuth2 client for Google Drive
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN_DRIVE })

    // google drive service obj
    const driveService = google.drive({version: "v3", auth: oAuth2Client});

    // file metadata
    const fileMetadata = {
        name: file.name,
        parents: ["1Ife2icaZMcooD4cP5kRAFyItZw5Hwvbd"],
        type: 'anyone',
    };

    // file metadata
    const media = {
        mimeType: file.mimetype,
        body: bufferToStream(file.data),
    };

    // insert file to drive.
    return await driveService.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
    });
}

/**
 * Updates an existing file in Google Drive given the file ID.
 *
 * @param {String} fileId - ID of the file to be updated.
 * @param {Object} file - The updated file containing mimetype and data.
 * @returns {Object} - Object containing the updated file ID.
 */
export const uploadModifiedFileToGoogleDrive = async (fileId, file) => {
    const oAuth2Client = new OAuth2(process.env.CLIENT_ID_DRIVE, process.env.CLIENT_SECRET_DRIVE)

    // OAuth2 client for Google Drive
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN_DRIVE })

    // google drive service obj
    const driveService = google.drive({version: "v3", auth: oAuth2Client});

    // file metadata
    const media = {
        mimeType: file.mimetype,
        body: bufferToStream(file.data),
    };

    // update file in drive given fileId.
    return await driveService.files.update({
        fileId: fileId,
        media: media,
    });
}

/**
 * Converts a buffer to a readable stream.
 *
 * @param {Buffer} buffer - The buffer to be converted to a stream.
 * @returns {Readable} - Readable stream.
 */
const bufferToStream = (buffer) => {
    const stream = new Readable()
    stream.push(buffer);
    stream.push(null);

    return stream;
}
