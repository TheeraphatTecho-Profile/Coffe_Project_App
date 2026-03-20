// Weather Service for Coffee Farm Management
export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  forecast: string;
  recommendations: string[];
}

export interface WeatherAlert {
  type: 'frost' | 'drought' | 'heavy_rain' | 'heat' | 'optimal';
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendations: string[];
}

export const WeatherService = {
  // Mock weather data - in production, integrate with real weather API
  async getCurrentWeather(province: string, district?: string): Promise<WeatherData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on typical Thai weather patterns
    const mockData: WeatherData = {
      temperature: 25 + Math.random() * 10, // 25-35°C
      humidity: 60 + Math.random() * 30, // 60-90%
      rainfall: Math.random() * 50, // 0-50mm
      windSpeed: 5 + Math.random() * 15, // 5-20 km/h
      condition: this.getRandomCondition(),
      forecast: this.getRandomForecast(),
      recommendations: this.generateRecommendations(province),
    };

    return mockData;
  },

  async getWeatherAlerts(weatherData: WeatherData): Promise<WeatherAlert[]> {
    const alerts: WeatherAlert[] = [];

    // Check for frost risk (temperature < 10°C)
    if (weatherData.temperature < 10) {
      alerts.push({
        type: 'frost',
        severity: 'high',
        message: 'อุณหภูมิต่ำเสี่ยงต่อน้ำค้านแข็ง',
        recommendations: [
          'คลุมต้นกาแฟด้วยพลาสติกหรือผ้า',
          'รดน้ำในเวลาเช้าเพื่อป้องกันน้ำค้านแข็ง',
          'ติดตามสภาพอากาศอย่างใกล้ชิด',
        ],
      });
    }

    // Check for drought risk (low humidity and rainfall)
    if (weatherData.humidity < 40 && weatherData.rainfall < 5) {
      alerts.push({
        type: 'drought',
        severity: 'medium',
        message: 'ความชื้นต่ำและฝนน้อย เสี่ยงแห้งแล้ง',
        recommendations: [
          'เพิ่มความถี่ในการรดน้ำ',
          'ใช้วัสดุคงความชื้นรอบโคนต้น',
          'ตรวจสอบระบบน้ำในสวน',
        ],
      });
    }

    // Check for heavy rain
    if (weatherData.rainfall > 30) {
      alerts.push({
        type: 'heavy_rain',
        severity: 'medium',
        message: 'ฝนตกหนัก เสี่ยงต่อพังผืดดิน',
        recommendations: [
          'ตรวจสอบระบบระบายน้ำในสวน',
          'หลีกเลี่ยงการใส่ปุ๋ยในช่วงฝนตกหนัก',
          'เฝ้าระวังโรครากเน่า',
        ],
      });
    }

    // Check for heat stress
    if (weatherData.temperature > 35) {
      alerts.push({
        type: 'heat',
        severity: 'high',
        message: 'อุณหภูมิสูง เสี่ยงต่อความเครียดต้นกาแฟ',
        recommendations: [
          'เพิ่มการรดน้ำในช่วงเช้าและเย็น',
          'ใช้วัสดุคลุมดินเพื่อลดอุณหภูมิ',
          'ตรวจสอบอาการใบเหลืองหรือไหม้',
        ],
      });
    }

    // Check for optimal conditions
    if (weatherData.temperature >= 20 && weatherData.temperature <= 28 &&
        weatherData.humidity >= 60 && weatherData.humidity <= 80 &&
        weatherData.rainfall >= 10 && weatherData.rainfall <= 25) {
      alerts.push({
        type: 'optimal',
        severity: 'low',
        message: 'สภาพอากาศเหมาะสำหรับการเจริญเติบโตของกาแฟ',
        recommendations: [
          'เป็นช่วงเวลาที่เหมาะสำหรับใส่ปุ๋ย',
          'ตรวจสอบสุขภาพต้นกาแฟทั่วทั้งสวน',
          'วางแผนการเก็บเกี่ยวล่วงหน้า',
        ],
      });
    }

    return alerts;
  },

  async getWeeklyForecast(province: string): Promise<WeatherData[]> {
    const forecast: WeatherData[] = [];
    
    for (let i = 0; i < 7; i++) {
      forecast.push({
        temperature: 25 + Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        rainfall: Math.random() * 50,
        windSpeed: 5 + Math.random() * 15,
        condition: this.getRandomCondition(),
        forecast: this.getRandomForecast(),
        recommendations: this.generateRecommendations(province),
      });
    }

    return forecast;
  },

  getRandomCondition(): string {
    const conditions = [
      'แดดจ้า',
      'มีเมฆ',
      'เมฆมาก',
      'ฝนเล็กน้อย',
      'ฝนปานกลาง',
      'ฝนตกหนัก',
      'พายุฝน',
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  },

  getRandomForecast(): string {
    const forecasts = [
      'อากาศดี ไม่มีฝน',
      'อาจมีฝนเล็กน้อย',
      'ฝนปานกลาง 60% โอกาส',
      'ฝนตกหนัก 80% โอกาส',
      'พายุเขตร้อย ควรระวัง',
    ];
    return forecasts[Math.floor(Math.random() * forecasts.length)];
  },

  generateRecommendations(province: string): string[] {
    const baseRecommendations = [
      'ตรวจสอบความชื้นในดิน',
      'สังเกตอาการของใบกาแฟ',
      'เตรียมความพร้อมรับมือฝน',
    ];

    // Province-specific recommendations
    const provinceSpecific: { [key: string]: string[] } = {
      'เลย': [
        'จังหวัดเลยมีอากาศหนาวเย็น ควรระมัดระวังอุณหภูมิต่ำ',
        'เหมาะสำหรับปลูกกาแฟอาราบิก้า',
      ],
      'เชียงราย': [
        'ภูมิภาคสูง อุณหภูมิเย็นกว่าที่อื่น',
        'ควรเตรียมการป้องกันน้ำค้านแข็ง',
      ],
      'นครสวรรค์': [
        'อากาศร้อนชื้น ควรให้ความสำคัญกับระบายน้ำ',
        'เหมาะสำหรับกาแฟโรบัสตา',
      ],
    };

    const specific = provinceSpecific[province] || [];
    return [...baseRecommendations, ...specific];
  },

  // Get coffee-specific weather insights
  getCoffeeInsights(weatherData: WeatherData): {
    growthStage: string;
    wateringNeeds: string;
    diseaseRisk: string;
    harvestReadiness: string;
  } {
    const insights = {
      growthStage: this.getGrowthStage(weatherData),
      wateringNeeds: this.getWateringNeeds(weatherData),
      diseaseRisk: this.getDiseaseRisk(weatherData),
      harvestReadiness: this.getHarvestReadiness(weatherData),
    };

    return insights;
  },

  getGrowthStage(weatherData: WeatherData): string {
    if (weatherData.temperature >= 18 && weatherData.temperature <= 24) {
      return 'อุณหภูมิเหมาะสำหรับการเจริญเติบโตของต้นกาแฟ';
    } else if (weatherData.temperature < 18) {
      return 'อุณหภูมิต่ำชะลอการเจริญเติบโต';
    } else {
      return 'อุณหภูมิสูงอาจส่งผลต่อความเครียดต้นกาแฟ';
    }
  },

  getWateringNeeds(weatherData: WeatherData): string {
    if (weatherData.humidity < 50 || weatherData.rainfall < 10) {
      return 'ต้องการน้ำเพิ่ม ควรรดน้ำวันละ 2 ครั้ง';
    } else if (weatherData.humidity > 80 || weatherData.rainfall > 30) {
      return 'ความชื้นสูง ลดการรดน้ำและตรวจสอบระบายน้ำ';
    } else {
      return 'ความชื้นปกติ รดน้ำวันละ 1 ครั้ง';
    }
  },

  getDiseaseRisk(weatherData: WeatherData): string {
    if (weatherData.humidity > 85 && weatherData.temperature > 25) {
      return 'ความเสี่ยงสูงต่อเชื้อรา ควรฉีดยาป้องกัน';
    } else if (weatherData.rainfall > 25) {
      return 'เสี่ยงโรคใบจุด ควรตรวจสอบและรักษา';
    } else {
      return 'ความเสี่ยงต่ำ สุขภาพต้นกาแฟดี';
    }
  },

  getHarvestReadiness(weatherData: WeatherData): string {
    if (weatherData.temperature >= 20 && weatherData.temperature <= 28 &&
        weatherData.humidity >= 60 && weatherData.humidity <= 75) {
      return 'สภาพอากาศเหมาะสำหรับการเก็บเกี่ยว';
    } else if (weatherData.rainfall > 20) {
      return 'ฝนตกหนัก ไม่เหมาะสำหรับเก็บเกี่ยว';
    } else {
      return 'สภาพอากาศปกติ สามารถเก็บเกี่ยวได้';
    }
  },
};

export default WeatherService;
