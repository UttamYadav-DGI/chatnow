import {Router} from 'express'
import { registerUser,loginUser,logoutUser } from '../Controllers/User.Controllers.js'
import { upload } from '../Middlewares/Multer.Middlewares.js';
import { verifyJWT } from '../Middlewares/Auth.Middlewares.js';
const router =Router();

router.route("/register").post(upload.single('avatar'), registerUser)
router.route("/login").post(upload.none(),loginUser)

router.route("/logout").post(verifyJWT,logoutUser)
export default router