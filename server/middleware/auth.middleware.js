import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import User from "../models/User.js";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

export function requireClerkAuth(req, res, next) {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  next();
}

export async function syncAuthenticatedUser(req, res, next) {
  try {
    const auth = getAuth(req);

    const clerkId = auth.userId;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const clerkUser = await clerkClient.users.getUser(clerkId);

    const email =
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      "unknown@example.com";

    const name =
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      clerkUser.username ||
      email.split("@")[0];

    console.log("Syncing User:");
    console.log({
      clerkId,
      email,
      name
    });

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = await User.create({
        clerkId,
        email,
        name
      });

      console.log("New user created");
    } else {
      user.email = email;
      user.name = name;

      await user.save();

      console.log("Existing user updated");
    }

    req.user = {
      clerkId,
      email,
      name
    };

    next();
  } catch (err) {
    console.error("SYNC USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined
    });
  }
}