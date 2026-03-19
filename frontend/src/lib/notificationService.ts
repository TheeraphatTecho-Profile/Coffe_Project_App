import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

export const NotificationService = {
  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1;
  },

  async createChannel(): Promise<void> {
    await notifee.createChannel({
      id: 'coffee-farm',
      name: 'Coffee Farm Notifications',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });
  },

  async scheduleHarvestReminder(
    id: string,
    farmName: string,
    date: Date
  ): Promise<void> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id,
        title: '咖啡 收割提醒',
        body: `สวน ${farmName} ถึงเวลาเก็บเกี่ยวแล้ว`,
        android: {
          channelId: 'coffee-farm',
          pressAction: { id: 'default' },
        },
      },
      trigger
    );
  },

  async scheduleCareReminder(
    id: string,
    farmName: string,
    date: Date
  ): Promise<void> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id,
        title: '🌱 ดูแลสวน',
        body: `ถึงเวลาดูแลสวน ${farmName}`,
        android: {
          channelId: 'coffee-farm',
          pressAction: { id: 'default' },
        },
      },
      trigger
    );
  },

  async cancelNotification(id: string): Promise<void> {
    await notifee.cancelNotification(id);
  },

  async cancelAllNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
  },

  async getScheduledNotifications(): Promise<string[]> {
    const notifications = await notifee.getTriggerNotificationIds();
    return notifications;
  },
};

export default NotificationService;
