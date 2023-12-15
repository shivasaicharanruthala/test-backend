import Router from './prepBuddy.routes.js';
import contactsRouter from './joblist-router.js';


export default (app) => {
    // all user routes
    app.use('/user', Router);
    app.use('/job-listings', contactsRouter);
}
