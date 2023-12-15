import express from 'express';

// imports JWT middleware for protecting the routes.
import protect from '../middleware/auth.middleware.js';

// imports users, mock-interviews, and interview-experiences controllers.
import * as prepBuddyController from './../controllers/prepBuddyControllers.js';
import * as mockInterviewController from "../controllers/mock-interviews-controllers.js";
import * as interviewExperienceController from './../controllers/interview-experience-controller.js';

const Router = express.Router();

// Routes for user sign-up, login, user email validation.
Router.route('/login').post(prepBuddyController.authenticateUser);
Router.route('/signup').post(prepBuddyController.userRegistration);
Router.route('/:userId/verify').get(prepBuddyController.validateUser);

// Route for mock-interview taken
Router.route('/:userId/interviews-taken').get(mockInterviewController.GetMockInterviewsTaken);

// Routes for mock-interviews entity CRUD
Router.route('/:userId/mock-interviews/').post(mockInterviewController.RequestMockInterview);
Router.route('/:userId/mock-interviews/').get(mockInterviewController.GetMockInterviewsByFilter);
Router.route('/:userId/mock-interviews/:mockInterviewId').get(mockInterviewController.GetMockInterviewByID);
Router.route('/:userId/mock-interviews/:mockInterviewId').put(mockInterviewController.ModifyMockInterview);
Router.route('/:userId/mock-interviews/:mockInterviewId').delete(mockInterviewController.DeleteMockInterview);

// Routes for mock-interviews accept & feedback update.
Router.route('/:interviewerId/mock-interviews/:mockInterviewId/accept-request').patch(mockInterviewController.AcceptMockInterviewRequest);
Router.route('/:interviewerId/mock-interviews/:mockInterviewId/feedback').patch(mockInterviewController.ModifyFeedback);

// Route for fetching user events.
Router.route('/:userId/events').get(mockInterviewController.GetUserEvents);

// Rotes for Interview experience CRUD
Router.route('/:userId/interview-experiences').post(interviewExperienceController.createInterviewExperience);
Router.route('/:userId/interview-experiences').get(interviewExperienceController.getAllInterviewExperience);
Router.route('/:userId/interview-experiences/:experienceId').get(interviewExperienceController.getInterviewExperience);
Router.route('/:userId/interview-experiences/:experienceId').put(interviewExperienceController.updateInterviewExperience);
Router.route('/:userId/interview-experiences/:experienceId').delete(interviewExperienceController.deleteInterviewExperience);

// Rote for Interview experience upvote/down-vote update.
Router.route('/:userId/interview-experiences/:experienceId').patch(interviewExperienceController.upvotesInterviewExperience); 

// Routes for Comments on interview-experiences CRUD.
Router.route('/:userId/interview-experiences/:experienceId/comment').get(interviewExperienceController.getAllInterviewExperienceComment);
Router.route('/:userId/interview-experiences/:experienceId/comment').post(interviewExperienceController.createInterviewExperienceComment);
Router.route('/:userId/interview-experiences/:experienceId/comment/:commentId').patch(interviewExperienceController.updateInterviewExperienceComment);
Router.route('/:userId/interview-experiences/:experienceId/comment/:commentId').delete(interviewExperienceController.deleteInterviewExperienceComment);

// export router
export default Router;