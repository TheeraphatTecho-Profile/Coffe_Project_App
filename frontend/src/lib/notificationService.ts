import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TimestampTrigger,
  TriggerType,
  AndroidStyle,
  AndroidBigTextStyle,
  EventType,
} from '@notifee/react-native';

export interface NotificationData {
  farmId?: string;
  harvestId?: string;
  type: 'harvest' | 'care' | 'weather' | 'price' | 'system';
  [key: string]: string | number | object | undefined;
}

export const NotificationService = {
  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1;
  },

  async createChannel(): Promise<void> {
    // Main farm notifications channel
    await notifee.createChannel({
      id: 'coffee-farm',
      name: 'Coffee Farm Notifications',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    // Weather alerts channel
    await notifee.createChannel({
      id: 'weather-alerts',
      name: 'Weather Alerts',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    // Price updates channel
    await notifee.createChannel({
      id: 'price-updates',
      name: 'Price Updates',
      importance: AndroidImportance.DEFAULT,
      visibility: AndroidVisibility.PUBLIC,
    });
  },

  async showImmediateNotification(
    title: string,
    body: string,
    data: NotificationData,
    channelId: string = 'coffee-farm'
  ): Promise<void> {
    await notifee.displayNotification({
      title,
      body,
      data: data as any,
      android: {
        channelId,
        pressAction: { id: 'default' },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: body,
        } as AndroidBigTextStyle,
      },
    });
  },

  async scheduleHarvestReminder(
    id: string,
    farmName: string,
    date: Date,
    farmId?: string
  ): Promise<void> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id,
        title: '☕ การเก็บเกี่ยวกาแฟ',
        body: `สวน ${farmName} ถึงเวลาเก็บเกี่ยวแล้ว!`,
        data: { farmId: farmId || '', type: 'harvest' },
        android: {
          channelId: 'coffee-farm',
          pressAction: { id: 'default' },
          style: {
            type: AndroidStyle.BIGTEXT,
            text: `ถึงเวลาเก็บเกี่ยวกาแฟจากสวน ${farmName} แล้ว อย่าลืมเตรียมอุปกรณ์และแรงงานครับ`,
          } as AndroidBigTextStyle,
        },
      },
      trigger
    );
  },

  async scheduleCareReminder(
    id: string,
    farmName: string,
    date: Date,
    farmId?: string
  ): Promise<void> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id,
        title: '🌱 การดูแลสวนกาแฟ',
        body: `ถึงเวลาดูแลสวน ${farmName}`,
        data: { farmId: farmId || '', type: 'care' },
        android: {
          channelId: 'coffee-farm',
          pressAction: { id: 'default' },
          style: {
            type: AndroidStyle.BIGTEXT,
            text: `ถึงเวลาดูแลสวนกาแฟ ${farmName} แล้ว ตรวจสอบความชื้นดินและสุขภาพต้นกาแฟครับ`,
          } as AndroidBigTextStyle,
        },
      },
      trigger
    );
  },

  async scheduleWeatherAlert(
    id: string,
    weatherCondition: string,
    recommendation: string,
    date: Date
  ): Promise<void> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id,
        title: '🌦️ แจ้งเตือนสภาพอากาศ',
        body: weatherCondition,
        data: { type: 'weather' },
        android: {
          channelId: 'weather-alerts',
          pressAction: { id: 'default' },
          style: {
            type: AndroidStyle.BIGTEXT,
            text: `${weatherCondition}\n\nคำแนะนำ: ${recommendation}`,
          } as AndroidBigTextStyle,
        },
      },
      trigger
    );
  },

  async schedulePriceAlert(
    id: string,
    price: number,
    changePercent: number,
    date: Date
  ): Promise<void> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    const trend = changePercent > 0 ? '📈 ขึ้น' : '📉 ลง';
    await notifee.createTriggerNotification(
      {
        id,
        title: `💰 ราคากาแฟ ${trend}`,
        body: `ราคาปัจจุบัน: ฿${price}/กก. (${changePercent > 0 ? '+' : ''}${changePercent}%)`,
        data: { type: 'price' },
        android: {
          channelId: 'price-updates',
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

  async getNotificationPermissions(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus >= 1;
  },

  async initializeNotificationService(): Promise<void> {
    // Request permission
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied');
      return;
    }

    // Create channels
    await this.createChannel();

    // Set up foreground service listener
    notifee.onForegroundEvent(({ type, detail }) => {
      console.log('Foreground notification event:', type, detail);
    });

    // Set up background event listener
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('Background notification event:', type, detail);
      
      if (type === EventType.PRESS) {
        console.log('Notification pressed:', detail.notification);
        // Handle notification press - navigate to relevant screen
        const { data } = detail.notification || {};
        if (data?.type === 'harvest' && data?.farmId) {
          // Navigate to farm details or harvest screen
          console.log('Navigate to farm:', data.farmId);
        }
      }
    });
  },
};

export default NotificationService;
