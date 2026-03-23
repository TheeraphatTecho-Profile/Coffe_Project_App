import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Logo } from '../../components/Logo';
import { MaintenanceService, MaintenanceTask, MAINTENANCE_SCHEDULES } from '../../lib/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { Farm, FarmService } from '../../lib/firebaseDb';

export const MaintenanceCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    loadData();
  }, [selectedFarm, selectedMonth, selectedYear]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [tasksData, farmsData] = await Promise.all([
        selectedFarm === 'all' 
          ? MaintenanceService.getAllTasks(user.uid)
          : MaintenanceService.getTasksByFarm(user.uid, selectedFarm),
        FarmService.getAll(user.uid)
      ]);
      
      // Filter tasks by selected month and year
      const filteredTasks = tasksData.filter(task => {
        const taskDate = new Date(task.scheduledDate);
        return taskDate.getMonth() + 1 === selectedMonth && taskDate.getFullYear() === selectedYear;
      });
      
      setTasks(filteredTasks);
      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [selectedFarm, selectedMonth, selectedYear]);

  const getTaskTypeInfo = (type: MaintenanceTask['type']) => {
    const typeInfo = {
      pruning: { icon: 'cut', color: '#FF6B6B', label: 'ตัดแต่ง' },
      fertilizing: { icon: 'leaf', color: '#4ECDC4', label: 'ใส่ปุ๋ย' },
      watering: { icon: 'water', color: '#45B7D1', label: 'ให้น้ำ' },
      harvesting: { icon: 'basket', color: '#FFA07A', label: 'เก็บเกี่ยว' },
      pest_control: { icon: 'bug', color: '#98D8C8', label: 'กำจัดศัตรู' },
      planting: { icon: 'flower', color: '#F7DC6F', label: 'ปลูกต้น' },
      other: { icon: 'ellipsis-horizontal', color: '#BDC3C7', label: 'อื่นๆ' },
    };
    return typeInfo[type] || typeInfo.other;
  };

  const getPriorityColor = (priority: MaintenanceTask['priority']) => {
    const colors = {
      urgent: '#E74C3C',
      high: '#F39C12',
      medium: '#3498DB',
      low: '#95A5A6',
    };
    return colors[priority];
  };

  const getStatusColor = (status: MaintenanceTask['status']) => {
    const colors = {
      pending: '#F39C12',
      in_progress: '#3498DB',
      completed: '#27AE60',
      skipped: '#95A5A6',
    };
    return colors[status];
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayTasks = tasks.filter(task => task.scheduledDate === dateStr);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            dayTasks.length > 0 && styles.calendarDayWithTasks
          ]}
          onPress={() => {
            if (dayTasks.length > 0) {
              const summary = dayTasks.map(t => {
                const info = getTaskTypeInfo(t.type);
                return `• ${info.label}: ${t.title}`;
              }).join('\n');
              const detail = `📅 ${dateStr}\n\n${summary}`;
              if (Platform.OS === 'web') {
                globalThis.alert(detail);
              } else {
                Alert.alert(`กิจกรรมวันที่ ${dateStr}`, summary);
              }
            } else {
              navigation.navigate('AddMaintenanceTask', { date: dateStr });
            }
          }}
        >
          <Text style={styles.calendarDayText}>{day}</Text>
          {dayTasks.length > 0 && (
            <View style={styles.dayTaskIndicator}>
              {dayTasks.slice(0, 3).map((task, index) => (
                <View
                  key={index}
                  style={[
                    styles.taskDot,
                    { backgroundColor: getTaskTypeInfo(task.type).color }
                  ]}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const renderMonthSelector = () => {
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    return (
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => {
            if (selectedMonth === 1) {
              setSelectedMonth(12);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>
          {monthNames[selectedMonth - 1]} {selectedYear + 543}
        </Text>
        
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => {
            if (selectedMonth === 12) {
              setSelectedMonth(1);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTaskList = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a.scheduledDate.localeCompare(b.scheduledDate);
    });

    return sortedTasks.map((task) => {
      const typeInfo = getTaskTypeInfo(task.type);
      const farmName = farms.find(f => f.id === task.farmId)?.name || 'สวนไม่ระบุ';
      
      return (
        <TouchableOpacity
          key={task.id}
          style={styles.taskCard}
          onPress={() => {
            const detail = `📋 ${task.title}\n📍 ${farmName}\n📅 ${task.scheduledDate}\n⏱️ ${task.estimatedDuration} ชม.\nสถานะ: ${task.status}\n📝 ${task.description || '-'}`;
            if (Platform.OS === 'web') {
              globalThis.alert(detail);
            } else {
              Alert.alert(task.title, detail);
            }
          }}
        >
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleRow}>
              <Ionicons 
                name={typeInfo.icon as any} 
                size={20} 
                color={typeInfo.color} 
              />
              <Text style={styles.taskTitle}>{task.title}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
              <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.taskDescription}>{task.description}</Text>
          <Text style={styles.taskFarm}>📍 {farmName}</Text>
          <Text style={styles.taskDate}>📅 {task.scheduledDate}</Text>
          
          <View style={styles.taskFooter}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
              <Text style={styles.statusText}>{task.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <Text style={styles.taskDuration}>⏱️ {task.estimatedDuration} ชม.</Text>
          </View>
        </TouchableOpacity>
      );
    });
  };

  const getSeasonalRecommendations = () => {
    const season = MaintenanceService.getSeasonForMonth(selectedMonth);
    return MaintenanceService.getSeasonalRecommendations(season);
  };

  const styles = React.useMemo(() => createStyles(colors, spacing, typography, radius, shadows), [colors, spacing, typography, radius, shadows]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Logo size="small" showText={false} />
            <Text style={styles.headerBrand}> สวนกาแฟเลย</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Title */}
          <Text style={styles.sectionLabel}>MAINTENANCE CALENDAR</Text>
          <Text style={styles.title}>ปฏิทินการดูแล</Text>
          <Text style={styles.subtitle}>
            จัดการกำหนดการดูแลสวนกาแฟตามฤดูกาล
          </Text>

          {/* Month Selector */}
          {renderMonthSelector()}

          {/* View Mode Toggle */}
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'calendar' && styles.viewModeButtonActive
              ]}
              onPress={() => setViewMode('calendar')}
            >
              <Ionicons 
                name="calendar" 
                size={16} 
                color={viewMode === 'calendar' ? colors.textOnPrimary : colors.text} 
              />
              <Text style={[
                styles.viewModeText,
                viewMode === 'calendar' && styles.viewModeTextActive
              ]}>
                ปฏิทิน
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'list' && styles.viewModeButtonActive
              ]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons 
                name="list" 
                size={16} 
                color={viewMode === 'list' ? colors.textOnPrimary : colors.text} 
              />
              <Text style={[
                styles.viewModeText,
                viewMode === 'list' && styles.viewModeTextActive
              ]}>
                รายการ
              </Text>
            </TouchableOpacity>
          </View>

          {/* Farm Selector */}
          <View style={styles.farmSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.farmChip,
                  selectedFarm === 'all' && styles.farmChipActive
                ]}
                onPress={() => setSelectedFarm('all')}
              >
                <Text style={[
                  styles.farmChipText,
                  selectedFarm === 'all' && styles.farmChipTextActive
                ]}>
                  ทุกสวน
                </Text>
              </TouchableOpacity>
              {farms.map((farm) => (
                <TouchableOpacity
                  key={farm.id}
                  style={[
                    styles.farmChip,
                    selectedFarm === farm.id && styles.farmChipActive
                  ]}
                  onPress={() => setSelectedFarm(farm.id)}
                >
                  <Text style={[
                    styles.farmChipText,
                    selectedFarm === farm.id && styles.farmChipTextActive
                  ]}>
                    {farm.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Seasonal Recommendations */}
          <View style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>คำแนะนำฤดู{MaintenanceService.getSeasonForMonth(selectedMonth) === 'winter' ? 'หนาว' : MaintenanceService.getSeasonForMonth(selectedMonth) === 'spring' ? 'ใบไม้ผลิ' : MaintenanceService.getSeasonForMonth(selectedMonth) === 'summer' ? 'ร้อน' : 'ใบไม้ร่วง'}</Text>
            {getSeasonalRecommendations().slice(0, 2).map((rec) => (
              <View key={rec.id} style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: getTaskTypeInfo(rec.type).color + '20' }]}>
                  <Ionicons name={getTaskTypeInfo(rec.type).icon as any} size={16} color={getTaskTypeInfo(rec.type).color} />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  <Text style={styles.recommendationDescription}>{rec.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Calendar or List View */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <SkeletonLoader width="100%" height={300} borderRadius={radius.lg} />
            </View>
          ) : viewMode === 'calendar' ? (
            <View style={styles.calendarContainer}>
              {/* Weekday headers */}
              <View style={styles.weekdayRow}>
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                  <Text key={index} style={styles.weekdayText}>{day}</Text>
                ))}
              </View>
              
              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {renderCalendar()}
              </View>
            </View>
          ) : (
            <View style={styles.taskListContainer}>
              {tasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={40} color={colors.textLight} />
                  <Text style={styles.emptyTitle}>ไม่มีกำหนดการในเดือนนี้</Text>
                  <Text style={styles.emptyText}>
                    เพิ่มกำหนดการดูแลสวนของคุณ
                  </Text>
                  <AnimatedButton
                    title="เพิ่มกำหนดการ"
                    onPress={() => navigation.navigate('AddMaintenanceTask', { 
                      date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01` 
                    })}
                    variant="outline"
                    size="medium"
                  />
                </View>
              ) : (
                renderTaskList()
              )}
            </View>
          )}

          {/* Action Button */}
          <AnimatedButton
            title="เพิ่มกำหนดการ"
            onPress={() => navigation.navigate('AddMaintenanceTask')}
            variant="primary"
            size="large"
            icon={<Ionicons name="add" size={20} color={colors.textOnPrimary} />}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerBrand: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  sectionLabel: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.secondary,
    letterSpacing: 1.5, marginBottom: spacing.sm,
  },
  title: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  subtitle: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xl },

  // Month Selector
  monthSelector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  monthButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  monthText: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
  },

  // View Mode Toggle
  viewModeToggle: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.xs, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  viewModeButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.sm, borderRadius: radius.md, gap: spacing.xs,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
  },
  viewModeText: {
    fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text,
  },
  viewModeTextActive: {
    color: colors.textOnPrimary,
  },

  // Farm Selector
  farmSelector: { marginBottom: spacing.lg },
  farmChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderLight, marginRight: spacing.sm,
  },
  farmChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  farmChipText: {
    fontSize: typography.sizes.sm, color: colors.text,
  },
  farmChipTextActive: {
    color: colors.textOnPrimary,
  },

  // Recommendations
  recommendationsCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  recommendationsTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    marginBottom: spacing.md,
  },
  recommendationIcon: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  recommendationContent: { flex: 1 },
  recommendationTitle: {
    fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  recommendationDescription: {
    fontSize: typography.sizes.xs, color: colors.textSecondary,
    lineHeight: 16,
  },

  // Loading
  loadingContainer: { alignItems: 'center', marginBottom: spacing.xl },

  // Calendar
  calendarContainer: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  weekdayRow: {
    flexDirection: 'row', marginBottom: spacing.sm,
  },
  weekdayText: {
    flex: 1, textAlign: 'center', fontSize: typography.sizes.xs,
    fontWeight: '600', color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%', aspectRatio: 1,
    borderWidth: 1, borderColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  calendarDayEmpty: {
    width: '14.28%', aspectRatio: 1,
  },
  calendarDayWithTasks: {
    backgroundColor: colors.primary + '10',
  },
  calendarDayText: {
    fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text,
  },
  dayTaskIndicator: {
    position: 'absolute', bottom: 2, flexDirection: 'row', gap: 1,
  },
  taskDot: {
    width: 4, height: 4, borderRadius: 2,
  },

  // Task List
  taskListContainer: { marginBottom: spacing.xl },
  taskCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  taskHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  taskTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm,
  },
  priorityText: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textOnPrimary,
  },
  taskDescription: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
    lineHeight: 18,
  },
  taskFarm: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  taskDate: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  taskFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm,
  },
  statusText: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textOnPrimary,
  },
  taskDuration: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },

  // Empty State
  emptyState: {
    alignItems: 'center', padding: spacing.xxxl, gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg, fontWeight: '600', color: colors.text,
  },
  emptyText: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },
});
