import { WeatherService, WeatherData } from '../../lib/weatherService';

describe('WeatherService', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('returns weather data within expected ranges and includes recommendations', async () => {
      jest.useFakeTimers();
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const promise = WeatherService.getCurrentWeather('เลย');
      jest.advanceTimersByTime(1000);
      const data = await promise;

      expect(data.temperature).toBeGreaterThanOrEqual(25);
      expect(data.temperature).toBeLessThanOrEqual(35);
      expect(data.humidity).toBeGreaterThanOrEqual(60);
      expect(data.humidity).toBeLessThanOrEqual(90);
      expect(data.rainfall).toBeGreaterThanOrEqual(0);
      expect(data.rainfall).toBeLessThanOrEqual(50);
      expect(data.recommendations.length).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(data.recommendations)).toBe(true);

      randomSpy.mockRestore();
    });
  });

  describe('getWeatherAlerts', () => {
    const base: WeatherData = {
      temperature: 25,
      humidity: 65,
      rainfall: 15,
      windSpeed: 10,
      condition: 'เมฆมาก',
      forecast: 'อากาศดี',
      recommendations: [],
    };

    it('detects frost, drought, heavy rain, heat, and optimal alerts', async () => {
      const frostAlerts = await WeatherService.getWeatherAlerts({ ...base, temperature: 5 });
      expect(frostAlerts.find(alert => alert.type === 'frost')).toBeTruthy();

      const droughtAlerts = await WeatherService.getWeatherAlerts({ ...base, humidity: 30, rainfall: 2 });
      expect(droughtAlerts.find(alert => alert.type === 'drought')).toBeTruthy();

      const heavyRainAlerts = await WeatherService.getWeatherAlerts({ ...base, rainfall: 40 });
      expect(heavyRainAlerts.find(alert => alert.type === 'heavy_rain')).toBeTruthy();

      const heatAlerts = await WeatherService.getWeatherAlerts({ ...base, temperature: 37 });
      expect(heatAlerts.find(alert => alert.type === 'heat')).toBeTruthy();

      const optimalAlerts = await WeatherService.getWeatherAlerts({ ...base, temperature: 24, humidity: 70, rainfall: 20 });
      expect(optimalAlerts.find(alert => alert.type === 'optimal')).toBeTruthy();
    });
  });

  describe('getWeeklyForecast', () => {
    it('returns 7 entries with generated recommendations', async () => {
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.3);

      const forecast = await WeatherService.getWeeklyForecast('เชียงราย');

      expect(forecast).toHaveLength(7);
      forecast.forEach(day => {
        expect(day.recommendations.length).toBeGreaterThanOrEqual(3);
      });

      randomSpy.mockRestore();
    });
  });

  describe('generateRecommendations', () => {
    it('includes province-specific suggestions when available', () => {
      const recs = WeatherService.generateRecommendations('เลย');

      expect(recs.some(text => text.includes('จังหวัดเลย'))).toBe(true);
      expect(recs.length).toBeGreaterThan(3);
    });
  });

  describe('getCoffeeInsights', () => {
    it('returns consistent insight strings based on weather inputs', () => {
      const data: WeatherData = {
        temperature: 22,
        humidity: 70,
        rainfall: 12,
        windSpeed: 8,
        condition: 'แดดจ้า',
        forecast: 'อากาศดี',
        recommendations: [],
      };

      const insights = WeatherService.getCoffeeInsights(data);

      expect(insights.growthStage).toContain('เจริญเติบโต');
      expect(insights.wateringNeeds).toContain('ความชื้นปกติ');
      expect(insights.diseaseRisk).toContain('ความเสี่ยงต่ำ');
      expect(insights.harvestReadiness).toContain('เหมาะสำหรับการเก็บเกี่ยว');
    });
  });
});
