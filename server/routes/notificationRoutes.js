import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();


// Get logged-in user's notifications
router.get(
  "/",
  authMiddleware,
  getMyNotifications
);


// Get unread notification count
router.get(
  "/unread-count",
  authMiddleware,
  getUnreadNotificationCount
);


// Mark one notification as read
router.put(
  "/:notificationId/read",
  authMiddleware,
  markNotificationAsRead
);


// Mark all notifications as read
router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);


export default router;