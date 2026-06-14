import { Router } from "express";
import { getUserAnalytics } from "../controllers/analytics.controller.js";
import { requireClerkAuth, syncAuthenticatedUser } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireClerkAuth, syncAuthenticatedUser);

router.get("/", getUserAnalytics);

export default router;
