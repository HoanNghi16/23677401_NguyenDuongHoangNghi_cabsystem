import { Notification } from "../models/Notification.js";

export const NotificationService = {

    GetNotifications: async (data) => {

        const userId = Number(data.user_id);

        if (!userId) {

            return {
                is_error: true,
                error_code: "INVALID_USER_ID",
                notifications: []
            };
        }

        const notifications =
            await Notification
                .find({
                    user_id: userId
                })
                .sort({
                    createdAt: -1
                })
                .limit(15)
                .lean();

        return {
            is_error: false,
            error_code: "",

            notifications: notifications.map(
                notification => ({
                    id: notification._id.toString(),

                    category:
                        notification.category,

                    user_id:
                        notification.user_id,

                    title:
                        notification.title,

                    content:
                        JSON.stringify(
                            notification.content
                        )
                })
            )
        };
    }

};