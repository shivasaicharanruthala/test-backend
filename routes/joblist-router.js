import express from 'express';
import * as contactsController  from '../controllers/job-controller.js';

const router=express.Router();

router.route('/')
 .post(contactsController.post)
 .get(contactsController.index);

 router.route('/:id')//parameterized path and new URL
 .get(contactsController.get)
 .put(contactsController.update)
 .delete(contactsController.remove);

 //Now create the export

 export default router;