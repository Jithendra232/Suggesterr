import { getAnalytics } from "../services/analytics.service.js";

export async function getUserAnalytics(req, res, next) {
  try {
    const analytics = await getAnalytics(req.user.clerkId);
    res.json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
}
