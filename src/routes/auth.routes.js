import {Router} from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter=Router();

authRouter.post("/register",authController.register);

authRouter.get("/refreshToken",authController.refreshToken);

authRouter.post("/logout",authController.logout);

authRouter.post("/logout-all",authController.logoutAll);

authRouter.post("/login",authController.login);

authRouter.get("/getMe",authController.getMe);

authRouter.post("/verify-email",authController.verifyEmail);

authRouter.post("/resend-otp",authController.resendOtp);

export default authRouter;