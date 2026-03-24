import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface MaintenanceTask {
  id?: string;
  userId: string;
  farmId: string;
  title: string;
  description: string;
  type: 'pruning' | 'fertilizing' | 'watering' | 'harvesting' | 'pest_control' | 'planting' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MaintenanceSchedule {
  id: string;
  type: MaintenanceTask['type'];
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'twice-weekly' | 'monthly' | 'quarterly' | 'seasonal' | 'yearly';
  season?: 'winter' | 'spring' | 'summer' | 'autumn';
  startMonth: number; // 1-12
  endMonth: number; // 1-12
  priority: MaintenanceTask['priority'];
  estimatedDuration: number;
  loeiSpecific: boolean;
  guidelines?: string;
}

export const MAINTENANCE_SCHEDULES: MaintenanceSchedule[] = [
  // ฤดูหนาว (พฤศจิกายน - กุมภาพันธ์)
  {
    id: 'winter-pruning',
    type: 'pruning',
    title: 'การตัดแต่งกิ่งฤดูหนาว',
    description: 'ตัดกิ่งที่แก่และแห้งเพื่อกระตุ้นการเจริญเติบโต',
    frequency: 'seasonal',
    season: 'winter',
    startMonth: 11,
    endMonth: 2,
    priority: 'high',
    estimatedDuration: 4,
    loeiSpecific: true,
    guidelines: 'ตัดหลังจากผลผลิตหลัก ใช้มีดที่คมสะอาด ทาสารป้องกันเชื้อราที่บาดแผล'
  },
  {
    id: 'winter-fertilizing',
    type: 'fertilizing',
    title: 'ใส่ปุ๋ยฤดูหนาว',
    description: 'ใส่ปุ๋ยอินทรีย์เพื่อเสริมสร้างดิน',
    frequency: 'seasonal',
    season: 'winter',
    startMonth: 12,
    endMonth: 1,
    priority: 'medium',
    estimatedDuration: 2,
    loeiSpecific: true,
    guidelines: 'ใช้ปุ๋ยคอกหรือปุ๋ยหมัก ใส่รอบๆ ต้น หลังจากตัดแต่งกิ่ง 1-2 สัปดาห์'
  },
  
  // ฤดูใบไม้ผลิ (มีนาคม - พฤษภาคม)
  {
    id: 'spring-watering',
    type: 'watering',
    title: 'ให้น้ำช่วงออกดอก',
    description: 'ให้น้ำสม่ำเสมอในช่วงออกดอก',
    frequency: 'weekly',
    season: 'spring',
    startMonth: 2,
    endMonth: 4,
    priority: 'high',
    estimatedDuration: 1,
    loeiSpecific: true,
    guidelines: 'ให้น้ำเช้า-เย็น หลีกเลี่ยงให้น้ำขณี้ดีซึ่งอาจทำให้ดอกร่วง'
  },
  {
    id: 'spring-pest-control',
    type: 'pest_control',
    title: 'ป้องกันศัตรูฤดูใบไม้ผลิ',
    description: 'ตรวจสอบและป้องกันแมลงวันและเชื้อรา',
    frequency: 'monthly',
    season: 'spring',
    startMonth: 3,
    endMonth: 5,
    priority: 'medium',
    estimatedDuration: 2,
    loeiSpecific: true,
    guidelines: 'ตรวจด้านใต้ใบเป็นประจำ ใช้น้ำมันพืชชนิดปลอดภัยเมื่อพบศัตรู'
  },
  
  // ฤดูร้อน (มิถุนายน - สิงหาคม)
  {
    id: 'summer-harvesting',
    type: 'harvesting',
    title: 'เก็บเกี่ยวกาแฟดิบ',
    description: 'เก็บเกี่ยวผลผลิตหลัก',
    frequency: 'seasonal',
    season: 'summer',
    startMonth: 10,
    endMonth: 12,
    priority: 'urgent',
    estimatedDuration: 8,
    loeiSpecific: true,
    guidelines: 'เก็ยเฉพาะผลที่สุกสีแดง ควรเก็ยในช่วงเช้าเพื่อความสดชื่น'
  },
  {
    id: 'summer-watering',
    type: 'watering',
    title: 'ให้น้ำช่วงร้อน',
    description: 'เพิ่มความถี่ในการให้น้ำ',
    frequency: 'twice-weekly',
    season: 'summer',
    startMonth: 4,
    endMonth: 9,
    priority: 'high',
    estimatedDuration: 1,
    loeiSpecific: true,
    guidelines: 'ให้น้ำช่วงเย็นเพื่อลดการระเหย'
  },
  
  // ฤดูใบไม้ร่วง (กันยายน - พฤศจิกายน)
  {
    id: 'autumn-fertilizing',
    type: 'fertilizing',
    title: 'ใส่ปุ๋ยฤดูใบไม้ร่วง',
    description: 'ใส่ปุ๋ยเคมีเพื่อเตรียมต้นสำหรับฤดูหนาว',
    frequency: 'seasonal',
    season: 'autumn',
    startMonth: 9,
    endMonth: 10,
    priority: 'medium',
    estimatedDuration: 2,
    loeiSpecific: true,
    guidelines: 'ใช้ปุ๋ยสูตร 13-13-21 หรือ 16-16-16 ใส่รอบๆ ต้นก่อนฝนตก'
  },
  {
    id: 'autumn-cleanup',
    type: 'other',
    title: 'ทำความสะอาดสวน',
    description: 'เก็บกวาดใบไม้และวัชพืช',
    frequency: 'monthly',
    season: 'autumn',
    startMonth: 10,
    endMonth: 11,
    priority: 'low',
    estimatedDuration: 3,
    loeiSpecific: false,
    guidelines: 'เก็บใบไม้ที่ร่วงเพื่อป้องกันเชื้อราและแมลง'
  }
];

export class MaintenanceService {
  private static collection = 'maintenance_tasks';

  static async createTask(task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const taskData = {
        ...task,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.collection), taskData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      throw error;
    }
  }

  static async updateTask(id: string, updates: Partial<MaintenanceTask>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, this.collection, id), updateData);
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      throw error;
    }
  }

  static async deleteTask(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collection, id));
    } catch (error) {
      console.error('Error deleting maintenance task:', error);
      throw error;
    }
  }

  static async getTask(userId: string, taskId: string): Promise<MaintenanceTask | null> {
    try {
      const docRef = doc(db, this.collection, taskId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().userId === userId) {
        return { id: docSnap.id, ...docSnap.data() } as MaintenanceTask;
      }
      return null;
    } catch (error) {
      console.error('Error getting maintenance task:', error);
      throw error;
    }
  }

  static async getAllTasks(userId: string): Promise<MaintenanceTask[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        orderBy('scheduledDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceTask[];
    } catch (error) {
      console.error('Error getting all maintenance tasks:', error);
      throw error;
    }
  }

  static async getTasksByFarm(userId: string, farmId: string): Promise<MaintenanceTask[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('farmId', '==', farmId),
        orderBy('scheduledDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceTask[];
    } catch (error) {
      console.error('Error getting tasks by farm:', error);
      throw error;
    }
  }

  static async getTasksByDateRange(userId: string, startDate: string, endDate: string): Promise<MaintenanceTask[]> {
    try {
      const allTasks = await this.getAllTasks(userId);
      return allTasks.filter(task => 
        task.scheduledDate >= startDate && task.scheduledDate <= endDate
      );
    } catch (error) {
      console.error('Error getting tasks by date range:', error);
      throw error;
    }
  }

  static async getUpcomingTasks(userId: string, days: number = 7): Promise<MaintenanceTask[]> {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = futureDate.toISOString().split('T')[0];
      
      const tasks = await this.getTasksByDateRange(userId, startDate, endDate);
      return tasks.filter(task => task.status !== 'completed');
    } catch (error) {
      console.error('Error getting upcoming tasks:', error);
      throw error;
    }
  }

  static async getOverdueTasks(userId: string): Promise<MaintenanceTask[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const allTasks = await this.getAllTasks(userId);
      
      return allTasks.filter(task => 
        task.scheduledDate < today && 
        task.status !== 'completed' && 
        task.status !== 'skipped'
      );
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      throw error;
    }
  }

  static async getTaskSummary(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    upcoming: number;
  }> {
    try {
      const [allTasks, upcomingTasks, overdueTasks] = await Promise.all([
        this.getAllTasks(userId),
        this.getUpcomingTasks(userId, 7),
        this.getOverdueTasks(userId)
      ]);

      return {
        total: allTasks.length,
        pending: allTasks.filter(task => task.status === 'pending').length,
        inProgress: allTasks.filter(task => task.status === 'in_progress').length,
        completed: allTasks.filter(task => task.status === 'completed').length,
        overdue: overdueTasks.length,
        upcoming: upcomingTasks.length,
      };
    } catch (error) {
      console.error('Error getting task summary:', error);
      throw error;
    }
  }

  static generateScheduledTasks(userId: string, farmId: string, month: number, year: number): Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>[] {
    const tasks: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    
    MAINTENANCE_SCHEDULES.forEach(schedule => {
      // Check if this schedule applies to the current month
      if (month >= schedule.startMonth && month <= schedule.endMonth) {
        // Generate tasks based on frequency
        if (schedule.frequency === 'seasonal') {
          tasks.push({
            userId,
            farmId,
            title: schedule.title,
            description: schedule.description,
            type: schedule.type,
            priority: schedule.priority,
            status: 'pending',
            scheduledDate: `${year}-${month.toString().padStart(2, '0')}-15`, // Mid-month
            estimatedDuration: schedule.estimatedDuration,
            notes: schedule.guidelines,
          });
        } else if (schedule.frequency === 'monthly') {
          tasks.push({
            userId,
            farmId,
            title: schedule.title,
            description: schedule.description,
            type: schedule.type,
            priority: schedule.priority,
            status: 'pending',
            scheduledDate: `${year}-${month.toString().padStart(2, '0')}-01`,
            estimatedDuration: schedule.estimatedDuration,
            notes: schedule.guidelines,
          });
        } else if (schedule.frequency === 'weekly') {
          // Generate 4 weekly tasks for the month
          for (let week = 1; week <= 4; week++) {
            const day = week * 7 - 3; // Approximate weekly spacing
            const date = new Date(year, month - 1, day);
            if (date.getMonth() === month - 1) { // Ensure date is within the month
              tasks.push({
                userId,
                farmId,
                title: schedule.title,
                description: schedule.description,
                type: schedule.type,
                priority: schedule.priority,
                status: 'pending',
                scheduledDate: date.toISOString().split('T')[0],
                estimatedDuration: schedule.estimatedDuration,
                notes: schedule.guidelines,
              });
            }
          }
        }
      }
    });
    
    return tasks;
  }

  static getSeasonForMonth(month: number): 'winter' | 'spring' | 'summer' | 'autumn' {
    if (month >= 11 || month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 9) return 'summer';
    return 'autumn';
  }

  static getSeasonalRecommendations(season: 'winter' | 'spring' | 'summer' | 'autumn'): MaintenanceSchedule[] {
    return MAINTENANCE_SCHEDULES.filter(schedule => 
      schedule.season === season && schedule.loeiSpecific
    );
  }
}
