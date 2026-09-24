import Notification from "../models/Notification.js";


// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    })
      .populate("relatedCase", "caseId")
      .populate(
        "relatedApplication",
        "applicationType status"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch notifications.",
    });
  }
};


// ==========================================
// GET UNREAD NOTIFICATION COUNT
// ==========================================

export const getUnreadNotificationCount = async (
  req,
  res
) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.userId,
      isRead: false,
    });

    return res.status(200).json({
      unreadCount: count,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch unread notification count.",
    });
  }
};


// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const { notificationId } = req.params;

    const notification =
      await Notification.findOne({
        _id: notificationId,
        recipient: req.user.userId,
      });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update notification.",
    });
  }
};


// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update notifications.",
    });
  }
};