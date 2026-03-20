// AI Insights Service for Coffee Farm Management
export interface FarmData {
  id: string;
  name: string;
  area: number;
  soil_type: string | null;
  water_source: string | null;
  altitude: number | null;
  variety: string | null;
  tree_count: number | null;
  planting_year: number | null;
  province: string;
  created_at: any;
}

export interface HarvestData {
  id: string;
  farm_id: string;
  harvest_date: string;
  variety: string | null;
  weight_kg: number;
  income: number;
  shift: string;
  created_at: any;
}

export interface AIInsight {
  id: string;
  type: 'yield_prediction' | 'disease_risk' | 'optimization' | 'market_trend' | 'care_recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  data_points: any[];
  created_at: string;
}

export interface YieldPrediction {
  predicted_yield: number; // kg
  confidence_interval: {
    min: number;
    max: number;
  };
  factors: {
    weather_impact: number;
    tree_health: number;
    historical_performance: number;
  };
  next_harvest_date: string;
}

export interface DiseaseRisk {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  likely_diseases: {
    name: string;
    probability: number;
    symptoms: string[];
    prevention: string[];
  }[];
  environmental_factors: {
    humidity: number;
    temperature: number;
    rainfall: number;
  };
}

export const AIInsightsService = {
  // Generate AI insights based on farm and harvest data
  async generateInsights(
    farms: FarmData[],
    harvests: HarvestData[]
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Generate yield predictions
    const yieldInsights = this.generateYieldPredictions(farms, harvests);
    insights.push(...yieldInsights);

    // Generate disease risk assessments
    const diseaseInsights = this.generateDiseaseRiskAssessments(farms);
    insights.push(...diseaseInsights);

    // Generate optimization recommendations
    const optimizationInsights = this.generateOptimizationRecommendations(farms, harvests);
    insights.push(...optimizationInsights);

    // Generate market trend insights
    const marketInsights = this.generateMarketTrendInsights(harvests);
    insights.push(...marketInsights);

    // Generate care recommendations
    const careInsights = this.generateCareRecommendations(farms, harvests);
    insights.push(...careInsights);

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },

  generateYieldPredictions(farms: FarmData[], harvests: HarvestData[]): AIInsight[] {
    const insights: AIInsight[] = [];

    farms.forEach(farm => {
      const farmHarvests = harvests.filter(h => h.farm_id === farm.id);
      
      if (farmHarvests.length > 0) {
        const avgYield = farmHarvests.reduce((sum, h) => sum + h.weight_kg, 0) / farmHarvests.length;
        const lastHarvest = farmHarvests.sort((a, b) => 
          new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime()
        )[0];

        // Calculate yield trend
        const recentHarvests = farmHarvests.slice(-3);
        const trend = this.calculateYieldTrend(recentHarvests);

        // Predict next harvest
        const prediction = this.predictNextYield(avgYield, trend, farm);

        const insight: AIInsight = {
          id: `yield_${farm.id}`,
          type: 'yield_prediction',
          title: `พยากรณ์ผลผลิตสวน ${farm.name}`,
          description: `คาดว่าผลผลิตครั้งต่อไปจะอยู่ที่ ${prediction.predicted_yield.toFixed(0)} กิโลกรัม`,
          confidence: 75 + Math.random() * 20, // 75-95%
          priority: trend > 0.1 ? 'high' : trend < -0.1 ? 'medium' : 'low',
          actionable: true,
          recommendations: this.generateYieldRecommendations(prediction, trend),
          data_points: [
            { label: 'ผลผลิตเฉลี่ย', value: avgYield.toFixed(1) },
            { label: 'แนวโน้ม', value: `${(trend * 100).toFixed(1)}%` },
            { label: 'คาดการณ์', value: `${prediction.predicted_yield.toFixed(0)} กก.` },
          ],
          created_at: new Date().toISOString(),
        };

        insights.push(insight);
      }
    });

    return insights;
  },

  generateDiseaseRiskAssessments(farms: FarmData[]): AIInsight[] {
    const insights: AIInsight[] = [];

    farms.forEach(farm => {
      // Simulate disease risk based on environmental factors
      const riskFactors = this.calculateDiseaseRiskFactors(farm);
      const overallRisk = this.calculateOverallDiseaseRisk(riskFactors);

      if (overallRisk.risk_level !== 'low') {
        const insight: AIInsight = {
          id: `disease_${farm.id}`,
          type: 'disease_risk',
          title: `ความเสี่ยงโรคในสวน ${farm.name}`,
          description: `ความเสี่ยงโรคระดับ ${this.getRiskLevelText(overallRisk.risk_level)}`,
          confidence: 70 + Math.random() * 25,
          priority: overallRisk.risk_level === 'critical' ? 'high' : 
                   overallRisk.risk_level === 'high' ? 'medium' : 'low',
          actionable: true,
          recommendations: this.generateDiseaseRecommendations(overallRisk),
          data_points: [
            { label: 'ความชื้น', value: `${riskFactors.humidity}%` },
            { label: 'อุณหภูมิ', value: `${riskFactors.temperature}°C` },
            { label: 'ปริมาณฝน', value: `${riskFactors.rainfall}มม.` },
          ],
          created_at: new Date().toISOString(),
        };

        insights.push(insight);
      }
    });

    return insights;
  },

  generateOptimizationRecommendations(farms: FarmData[], harvests: HarvestData[]): AIInsight[] {
    const insights: AIInsight[] = [];

    farms.forEach(farm => {
      const farmHarvests = harvests.filter(h => h.farm_id === farm.id);
      
      if (farmHarvests.length > 0) {
        const optimizations = this.identifyOptimizationOpportunities(farm, farmHarvests);
        
        optimizations.forEach((opt, index) => {
          const insight: AIInsight = {
            id: `opt_${farm.id}_${index}`,
            type: 'optimization',
            title: `เพิ่มประสิทธิภาพสวน ${farm.name}`,
            description: opt.description,
            confidence: opt.confidence,
            priority: opt.priority,
            actionable: true,
            recommendations: opt.recommendations,
            data_points: opt.data_points,
            created_at: new Date().toISOString(),
          };

          insights.push(insight);
        });
      }
    });

    return insights;
  },

  generateMarketTrendInsights(harvests: HarvestData[]): AIInsight[] {
    const insights: AIInsight[] = [];

    if (harvests.length > 0) {
      // Calculate price trends
      const priceTrend = this.calculatePriceTrend(harvests);
      const yieldTrend = this.calculateYieldTrend(harvests);

      const insight: AIInsight = {
        id: 'market_trends',
        type: 'market_trend',
        title: 'แนวโน้มตลาดกาแฟ',
        description: `ราคากาแฟ${priceTrend > 0 ? 'เพิ่มขึ้น' : 'ลดลง'} ${(Math.abs(priceTrend) * 100).toFixed(1)}% ในช่วง 3 เดือนที่ผ่านมา`,
        confidence: 80,
        priority: Math.abs(priceTrend) > 0.1 ? 'high' : 'medium',
        actionable: true,
        recommendations: this.generateMarketRecommendations(priceTrend, yieldTrend),
        data_points: [
          { label: 'แนวโน้มราคา', value: `${(priceTrend * 100).toFixed(1)}%` },
          { label: 'แนวโน้มผลผลิต', value: `${(yieldTrend * 100).toFixed(1)}%` },
          { label: 'ราคาเฉลี่ย', value: `฿${this.calculateAveragePrice(harvests).toFixed(0)}/กก.` },
        ],
        created_at: new Date().toISOString(),
      };

      insights.push(insight);
    }

    return insights;
  },

  generateCareRecommendations(farms: FarmData[], harvests: HarvestData[]): AIInsight[] {
    const insights: AIInsight[] = [];

    farms.forEach(farm => {
      const recommendations = this.generateSeasonalCareRecommendations(farm);
      
      recommendations.forEach((rec, index) => {
        const insight: AIInsight = {
          id: `care_${farm.id}_${index}`,
          type: 'care_recommendation',
          title: `การดูแลสวน ${farm.name}`,
          description: rec.description,
          confidence: rec.confidence,
          priority: rec.priority,
          actionable: true,
          recommendations: rec.recommendations,
          data_points: rec.data_points,
          created_at: new Date().toISOString(),
        };

        insights.push(insight);
      });
    });

    return insights;
  },

  // Helper methods
  calculateYieldTrend(harvests: HarvestData[]): number {
    if (harvests.length < 2) return 0;
    
    const sorted = harvests.sort((a, b) => 
      new Date(a.harvest_date).getTime() - new Date(b.harvest_date).getTime()
    );
    
    const first = sorted[0].weight_kg;
    const last = sorted[sorted.length - 1].weight_kg;
    
    return (last - first) / first;
  },

  predictNextYield(avgYield: number, trend: number, farm: FarmData): YieldPrediction {
    const basePrediction = avgYield * (1 + trend);
    
    // Adjust for farm-specific factors
    let adjustment = 1;
    
    // Tree density factor
    if (farm.tree_count && farm.area) {
      const density = farm.tree_count / (farm.area * 1600); // trees per sq km
      if (density > 1000) adjustment *= 1.1; // Good density
      else if (density < 500) adjustment *= 0.9; // Low density
    }
    
    // Altitude factor
    if (farm.altitude) {
      if (farm.altitude >= 800 && farm.altitude <= 1200) {
        adjustment *= 1.05; // Optimal altitude for Arabica
      }
    }
    
    const predicted = basePrediction * adjustment;
    
    return {
      predicted_yield: predicted,
      confidence_interval: {
        min: predicted * 0.8,
        max: predicted * 1.2,
      },
      factors: {
        weather_impact: 0.3 + Math.random() * 0.4,
        tree_health: 0.2 + Math.random() * 0.3,
        historical_performance: 0.3 + Math.random() * 0.3,
      },
      next_harvest_date: this.calculateNextHarvestDate(farm),
    };
  },

  calculateNextHarvestDate(farm: FarmData): string {
    const lastHarvestDate = new Date();
    const daysUntilNext = 180 + Math.random() * 60; // 6-8 months
    const nextDate = new Date(lastHarvestDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
    return nextDate.toISOString();
  },

  generateYieldRecommendations(prediction: YieldPrediction, trend: number): string[] {
    const recommendations = [
      'ตรวจสอบสุขภาพต้นกาแฟทั่วทั้งสวน',
      'เตรียมแรงงานสำหรับการเก็บเกี่ยว',
      'ตรวจสอบอุปกรณ์และคั่วกาแฟ',
    ];

    if (trend > 0.1) {
      recommendations.push('พิจารณาขยายพื้นที่ปลูก');
      recommendations.push('วางแผนการตลาดเพิ่มเติม');
    } else if (trend < -0.1) {
      recommendations.push('ตรวจสอบสาเหตุที่ทำให้ผลผลิตลดลง');
      recommendations.push('เพิ่มการใส่ปุ๋ยและดูแลต้น');
      recommendations.push('ปรึกษาผู้เชี่ยวชาญด้านกาแฟ');
    }

    return recommendations;
  },

  calculateDiseaseRiskFactors(farm: FarmData): any {
    // Simulate environmental factors
    return {
      humidity: 65 + Math.random() * 30,
      temperature: 20 + Math.random() * 15,
      rainfall: Math.random() * 100,
    };
  },

  calculateOverallDiseaseRisk(factors: any): DiseaseRisk {
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (factors.humidity > 85 && factors.temperature > 25) {
      risk_level = 'critical';
    } else if (factors.humidity > 75 || factors.rainfall > 50) {
      risk_level = 'high';
    } else if (factors.humidity > 65) {
      risk_level = 'medium';
    }

    const likely_diseases = [
      {
        name: 'ราใบใบกาแฟ',
        probability: risk_level === 'critical' ? 0.8 : risk_level === 'high' ? 0.6 : 0.3,
        symptoms: ['ใบมีจุดสีน้ำตาล', 'ใบเหลือง', 'ใบร่วง'],
        prevention: ['ระบายน้ำดี', 'พ่นยาป้องกัน', 'ตัดแต่งกิ่ง'],
      },
      {
        name: 'โรครากเน่า',
        probability: risk_level === 'critical' ? 0.7 : risk_level === 'high' ? 0.5 : 0.2,
        symptoms: ['ต้นเหลือง', 'ใบร่วง', 'รากเน่า'],
        prevention: ['ระบายน้ำดี', 'ดินร่วนซุน', 'ใส่ปุ๋ยควบคุม'],
      },
    ];

    return {
      risk_level,
      likely_diseases,
      environmental_factors: factors,
    };
  },

  getRiskLevelText(level: string): string {
    const texts = {
      low: 'ต่ำ',
      medium: 'ปานกลาง',
      high: 'สูง',
      critical: 'วิกฤต',
    };
    return texts[level as keyof typeof texts] || 'ไม่ทราบ';
  },

  generateDiseaseRecommendations(risk: DiseaseRisk): string[] {
    const recommendations = ['ตรวจสอบต้นกาแฟทุกวัน'];
    
    if (risk.risk_level === 'critical') {
      recommendations.push('ฉีดยาป้องกันโรคทันที');
      recommendations.push('ลดการรดน้ำชั่วคราว');
      recommendations.push('ปรึกษาเกษตรกรผู้เชี่ยวชาญ');
    } else if (risk.risk_level === 'high') {
      recommendations.push('เพิ่มการระบายน้ำในสวน');
      recommendations.push('พ่นยาป้องกันตามกำหนด');
      recommendations.push('เฝ้าระวังอาการโรคอย่างใกล้ชิด');
    } else {
      recommendations.push('ดูแลความสะอาดในสวน');
      recommendations.push('ตัดแต่งกิ่งให้ถูกต้อง');
    }

    return recommendations;
  },

  identifyOptimizationOpportunities(farm: FarmData, harvests: HarvestData[]): any[] {
    const opportunities = [];

    // Check if tree density is optimal
    if (farm.tree_count && farm.area) {
      const density = farm.tree_count / (farm.area * 1600);
      
      if (density < 500) {
        opportunities.push({
          description: 'ความหนาแน่นของต้นกาแฟต่ำกว่าเกณฑ์',
          confidence: 85,
          priority: 'medium',
          recommendations: [
            'พิจารณาเพิ่มความหนาแน่นต้นกาแฟ',
            'วางแผนการปลูกต้นเพิ่มในพื้นที่ว่าง',
            'คำนวณระยะห่างที่เหมาะสมสำหรับพันธุ์นี้',
          ],
          data_points: [
            { label: 'ความหนาแน่นปัจจุบัน', value: `${density.toFixed(0)} ต้น/ตร.กม.` },
            { label: 'ความหนาแน่นที่แนะนำ', value: '800-1200 ต้น/ตร.กม.' },
          ],
        });
      }
    }

    // Check yield consistency
    const yields = harvests.map(h => h.weight_kg);
    const stdDev = this.calculateStandardDeviation(yields);
    const mean = yields.reduce((a, b) => a + b, 0) / yields.length;
    const cv = (stdDev / mean) * 100; // Coefficient of variation

    if (cv > 20) {
      opportunities.push({
        description: 'ผลผลิตไม่สม่ำเสมอ',
        confidence: 75,
        priority: 'high',
        recommendations: [
          'วิเคราะห์สาเหตุของความแปรผัน',
          'มาตรฐานการดูแลต้นกาแฟ',
          'บันทึกข้อมูลการเก็บเกี่ยวอย่างละเอียด',
        ],
        data_points: [
          { label: 'ค่าความแปรผัน', value: `${cv.toFixed(1)}%` },
          { label: 'เกณฑ์ที่ยอมรับ', value: '< 20%' },
        ],
      });
    }

    return opportunities;
  },

  calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  },

  calculatePriceTrend(harvests: HarvestData[]): number {
    if (harvests.length < 2) return 0;
    
    const sorted = harvests.sort((a, b) => 
      new Date(a.harvest_date).getTime() - new Date(b.harvest_date).getTime()
    );
    
    const first = sorted[0].income / sorted[0].weight_kg;
    const last = sorted[sorted.length - 1].income / sorted[sorted.length - 1].weight_kg;
    
    return (last - first) / first;
  },

  calculateAveragePrice(harvests: HarvestData[]): number {
    const totalIncome = harvests.reduce((sum, h) => sum + h.income, 0);
    const totalWeight = harvests.reduce((sum, h) => sum + h.weight_kg, 0);
    return totalIncome / totalWeight;
  },

  generateMarketRecommendations(priceTrend: number, yieldTrend: number): string[] {
    const recommendations = [
      'ติดตามราคากาแฟในตลาดโลก',
      'วิเคราะห์ความต้องการของลูกค้า',
    ];

    if (priceTrend > 0.05) {
      recommendations.push('พิจารณาขายในราคาที่ดีขึ้น');
      recommendations.push('วางแผนการเก็บเกี่ยวเพิ่มเติม');
    } else if (priceTrend < -0.05) {
      recommendations.push('พิจารณาเก็บเกี่ยวไว้ขายภายหลัง');
      recommendations.push('มองหาช่องทางการขายใหม่');
    }

    return recommendations;
  },

  generateSeasonalCareRecommendations(farm: FarmData): any[] {
    const month = new Date().getMonth();
    const recommendations = [];

    // Seasonal recommendations based on month (0-11, Jan-Dec)
    if (month >= 2 && month <= 4) { // Mar-May - Hot season
      recommendations.push({
        description: 'การดูแลในฤดูร้อน',
        confidence: 90,
        priority: 'high',
        recommendations: [
          'เพิ่มการรดน้ำในช่วงเช้าและเย็น',
          'ใช้วัสดุคลุมดินเพื่อลดอุณหภูมิ',
          'ตรวจสอบอาการใบเหลืองจากความร้อน',
        ],
        data_points: [
          { label: 'ฤดู', value: 'ร้อน' },
          { label: 'ความเสี่ยง', value: 'ความเครียดจากความร้อน' },
        ],
      });
    } else if (month >= 5 && month <= 10) { // Jun-Nov - Rainy season
      recommendations.push({
        description: 'การดูแลในฤดูฝน',
        confidence: 85,
        priority: 'medium',
        recommendations: [
          'ตรวจสอบระบบระบายน้ำในสวน',
          'เฝ้าระวังโรคราใบจุด',
          'ลดการใส่ปุ๋ยในช่วงฝนตกหนัก',
        ],
        data_points: [
          { label: 'ฤดู', value: 'ฝน' },
          { label: 'ความเสี่ยง', value: 'โรคราและพังผืดดิน' },
        ],
      });
    } else { // Nov-Feb - Cool season
      recommendations.push({
        description: 'การดูแลในฤดูหนาว',
        confidence: 80,
        priority: 'low',
        recommendations: [
          'เหมาะสำหรับการตัดแต่งกิ่ง',
          'เพิ่มการใส่ปุ๋ยเพื่อเสริมกำลังต้น',
          'เตรียมการเก็บเกี่ยวในฤดูที่เหมาะสม',
        ],
        data_points: [
          { label: 'ฤดู', value: 'หนาว' },
          { label: 'ความเสี่ยง', value: 'อุณหภูมิต่ำ' },
        ],
      });
    }

    return recommendations;
  },
};

export default AIInsightsService;
