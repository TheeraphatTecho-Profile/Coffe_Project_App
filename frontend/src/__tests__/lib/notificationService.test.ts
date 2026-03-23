import notifee from '@notifee/react-native';
import NotificationService from '../../lib/notificationService';

const mockNotifee = notifee as jest.Mocked<typeof notifee>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotifee.requestPermission.mockResolvedValue({ authorizationStatus: 1 } as any);
    mockNotifee.getNotificationSettings.mockResolvedValue({ authorizationStatus: 1 } as any);
    mockNotifee.getTriggerNotificationIds.mockResolvedValue([]);
  });

  describe('permission helpers', () => {
    it('requestPermission returns true when authorized', async () => {
      mockNotifee.requestPermission.mockResolvedValueOnce({ authorizationStatus: 2 } as any);

      const granted = await NotificationService.requestPermission();

      expect(granted).toBe(true);
      expect(mockNotifee.requestPermission).toHaveBeenCalledTimes(1);
    });

    it('requestPermission returns false when denied', async () => {
      mockNotifee.requestPermission.mockResolvedValueOnce({ authorizationStatus: 0 } as any);

      const granted = await NotificationService.requestPermission();

      expect(granted).toBe(false);
    });

    it('getNotificationPermissions pulls from settings', async () => {
      mockNotifee.getNotificationSettings.mockResolvedValueOnce({ authorizationStatus: 3 } as any);

      const allowed = await NotificationService.getNotificationPermissions();

      expect(allowed).toBe(true);
      expect(mockNotifee.getNotificationSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('channel + immediate notifications', () => {
    it('createChannel registers all predefined channels', async () => {
      await NotificationService.createChannel();

      expect(mockNotifee.createChannel).toHaveBeenCalledTimes(3);
      expect(mockNotifee.createChannel).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'coffee-farm' }),
      );
      expect(mockNotifee.createChannel).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'weather-alerts', name: 'Weather Alerts' }),
      );
      expect(mockNotifee.createChannel).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'price-updates' }),
      );
    });

    it('showImmediateNotification forwards payload to notifee', async () => {
      await NotificationService.showImmediateNotification('Title', 'Body text', { type: 'system' }, 'coffee-farm');

      expect(mockNotifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Title',
          body: 'Body text',
          android: expect.objectContaining({ channelId: 'coffee-farm' }),
        }),
      );
    });
  });

  describe('scheduled reminders', () => {
    it('scheduleHarvestReminder creates timestamp trigger in main channel', async () => {
      const date = new Date('2024-03-20T06:00:00Z');

      await NotificationService.scheduleHarvestReminder('harvest-1', 'สวนเขาใหญ่', date, 'farm-1');

      expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'harvest-1',
          data: { farmId: 'farm-1', type: 'harvest' },
          android: expect.objectContaining({ channelId: 'coffee-farm' }),
        }),
        expect.objectContaining({
          timestamp: date.getTime(),
        }),
      );
    });

    it('scheduleCareReminder targets care channel with metadata', async () => {
      const date = new Date('2024-04-01T01:00:00Z');

      await NotificationService.scheduleCareReminder('care-1', 'สวนบ้านโคก', date, 'farm-77');

      expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'care-1',
          data: { farmId: 'farm-77', type: 'care' },
        }),
        expect.objectContaining({
          timestamp: date.getTime(),
        }),
      );
    });

    it('scheduleWeatherAlert uses weather channel and big text', async () => {
      const when = new Date('2024-05-01T00:00:00Z');

      await NotificationService.scheduleWeatherAlert('weather-1', 'ฝนตกหนัก', 'เตรียมระบายน้ำ', when);

      expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'weather-1',
          android: expect.objectContaining({ channelId: 'weather-alerts' }),
        }),
        expect.objectContaining({ timestamp: when.getTime() }),
      );
    });

    it('schedulePriceAlert formats trend text', async () => {
      const date = new Date('2024-06-15T00:00:00Z');

      await NotificationService.schedulePriceAlert('price-1', 120, 5, date);

      expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('📈'),
          body: 'ราคาปัจจุบัน: ฿120/กก. (+5%)',
          android: expect.objectContaining({ channelId: 'price-updates' }),
        }),
        expect.objectContaining({ timestamp: date.getTime() }),
      );
    });
  });

  describe('cancellation helpers', () => {
    it('cancelNotification delegates to notifee', async () => {
      await NotificationService.cancelNotification('notif-1');

      expect(mockNotifee.cancelNotification).toHaveBeenCalledWith('notif-1');
    });

    it('cancelAllNotifications clears every scheduled notification', async () => {
      await NotificationService.cancelAllNotifications();

      expect(mockNotifee.cancelAllNotifications).toHaveBeenCalledTimes(1);
    });

    it('getScheduledNotifications returns ids from notifee', async () => {
      mockNotifee.getTriggerNotificationIds.mockResolvedValueOnce(['a', 'b']);

      const ids = await NotificationService.getScheduledNotifications();

      expect(ids).toEqual(['a', 'b']);
    });
  });

  describe('initializeNotificationService', () => {
    it('sets up channels and listeners when permission granted', async () => {
      await NotificationService.initializeNotificationService();

      expect(mockNotifee.requestPermission).toHaveBeenCalled();
      expect(mockNotifee.createChannel).toHaveBeenCalledTimes(3);
      expect(mockNotifee.onForegroundEvent).toHaveBeenCalledTimes(1);
      expect(mockNotifee.onBackgroundEvent).toHaveBeenCalledTimes(1);
    });

    it('stops setup when permission denied', async () => {
      mockNotifee.requestPermission.mockResolvedValueOnce({ authorizationStatus: 0 } as any);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      await NotificationService.initializeNotificationService();

      expect(mockNotifee.createChannel).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith('Notification permission denied');
      warnSpy.mockRestore();
    });
  });
});
