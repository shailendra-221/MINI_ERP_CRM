import { Router } from "express";
import { login, me, signup } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, signupSchema } from "../validators/auth.validator";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/signup", validate(signupSchema), signup);
router.get("/me", authenticate, me);

export default router;
