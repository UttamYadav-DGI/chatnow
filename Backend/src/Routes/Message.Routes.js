import {Router} from 'express'
import { sendMessage,allMessages } from '../Controllers/Message.Controllers.js';
import { upload } from '../Middlewares/Multer.Middlewares.js';
import { verifyJWT } from '../Middlewares/Auth.Middlewares.js';
const router =Router();
router.use(verifyJWT);

router.route('/sendMessage').post(sendMessage);
router.route('/:chat').get(allMessages);

export default router;