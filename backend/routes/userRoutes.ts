import {Router} from 'express'
import  {Login, registerUser,sendOtp,verifyOtp,resendOtp} from '../controllers/user/userCOntroller.js'

const router = Router()

router.post('/login',Login)
router.post('/register',registerUser)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);


export default router