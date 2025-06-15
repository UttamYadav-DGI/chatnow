import {Router} from 'express'
import { accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGrp} from '../Controllers/Chat.Controllers.js';
import { upload } from '../Middlewares/Multer.Middlewares.js';
import { verifyJWT } from '../Middlewares/Auth.Middlewares.js';
const router =Router();
router.use(verifyJWT);

router.post("/new",accessChat);
router.post("/chat",fetchChats);
router.post("/newGroupChat",createGroupChat);
router.put("/renameChat",renameGroup);
router.put("/add",addToGroup);
router.delete("/removed",removeFromGrp);

export default router