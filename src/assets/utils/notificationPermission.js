import {
  getToken,
  onMessage,
} from "firebase/messaging";

import { messaging } from "../../firebase/config";

export const requestNotificationPermission =
  async () => {
    try {
      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: "BNSkrKfXIg968vhAb-KcSk7x5knlR67nEhIq-dlD7mGAbN1AgAABQlEmPq1ISNesMUvqW0JvyMQymywrAna0jv4",
      });

      return token;
    } catch (err) {
      console.log(err);
    }
  };

export const listenToForegroundMessages =
  () => {
    onMessage(messaging, (payload) => {
      console.log(
        "Foreground notification:",
        payload
      );
    });
  };