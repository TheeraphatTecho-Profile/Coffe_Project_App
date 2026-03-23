import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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

export const MaintenanceDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<MaintenanceTask[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<MaintenanceTask[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [tasksData, farmsData, summaryData, upcomingData, overdueData] = await Promise.all([
        MaintenanceService.getAllTasks(user.uid),
        FarmService.getAll(user.uid),
        MaintenanceService.getTaskSummary(user.uid),
        MaintenanceService.getUpcomingTasks(user.uid, 7),
        MaintenanceService.getOverdueTasks(user.uid)
      ]);
      
      setTasks(tasksData);
      setFarms(farmsData);
      setSummary(summaryData);
      setUpcomingTasks(upcomingData);
      setOverdueTasks(overdueData);
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
  }, []);

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

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.name || 'สวนไม่ระบุ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const getSeasonalInsights = () => {
    const currentMonth = new Date().getMonth() + 1;
    const season = MaintenanceService.getSeasonForMonth(currentMonth);
    const recommendations = MaintenanceService.getSeasonalRecommendations(season);
    
    return recommendations.slice(0, 3);
  };

  const renderSummaryCards = () => {
    if (!summary) return null;

    return (
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          <Text style={styles.summaryLabel}>กิจกรรมทั้งหมด</Text>
          <Text style={styles.summaryValue}>{summary.total}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="time-outline" size={24} color={colors.warning} />
          <Text style={styles.summaryLabel}>รอดำเนินการ</Text>
          <Text style={styles.summaryValue}>{summary.pending + summary.inProgress}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
          <Text style={styles.summaryLabel}>เสร็จสิ้น</Text>
          <Text style={styles.summaryValue}>{summary.completed}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
          <Text style={styles.summaryLabel}>เลยกำหนด</Text>
          <Text style={styles.summaryValue}>{summary.overdue}</Text>
        </View>
      </View>
    );
  };

  const renderUpcomingTasks = () => {
    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>กำหนดการใกล้เคียง</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MaintenanceCalendar')}>
            <Text style={styles.seeAll}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>
        
        {upcomingTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={colors.textLight} />
            <Text style={styles.emptyTitle}>ไม่มีกำหนดการใกล้เคียง</Text>
            <Text style={styles.emptyText}>เพิ่มกำหนดการสำหรับสัปดาห์นี้</Text>
          </View>
        ) : (
          upcomingTasks.slice(0, 3).map((task) => {
            const typeInfo = getTaskTypeInfo(task.type);
            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => navigation.navigate('MaintenanceTaskDetail', { taskId: task.id })}
              >
                <View style={[styles.taskIcon, { backgroundColor: typeInfo.color + '20' }]}>
                  <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskFarm}>{getFarmName(task.farmId)}</Text>
                  <Text style={styles.taskDate}>📅 {formatDate(task.scheduledDate)}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.priorityText}>{task.priority.substring(0, 1).toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    );
  };

  const renderOverdueTasks = () => {
    if (overdueTasks.length === 0) return null;

    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚠️ เลยกำหนด</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MaintenanceCalendar')}>
            <Text style={styles.seeAll}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>
        
        {overdueTasks.slice(0, 3).map((task) => {
          const typeInfo = getTaskTypeInfo(task.type);
          const daysOverdue = Math.floor((new Date().getTime() - new Date(task.scheduledDate).getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <TouchableOpacity
              key={task.id}
              style={styles.overdueTaskItem}
              onPress={() => navigation.navigate('MaintenanceTaskDetail', { taskId: task.id })}
            >
              <View style={[styles.taskIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name={typeInfo.icon as any} size={20} color={colors.error} />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskFarm}>{getFarmName(task.farmId)}</Text>
                <Text style={styles.overdueText}>เลยกำหนด {daysOverdue} วัน</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.priorityText}>!</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderSeasonalInsights = () => {
    const insights = getSeasonalInsights();
    
    return (
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🌿 คำแนะนำฤดูกาล</Text>
        {insights.map((insight) => {
          const typeInfo = getTaskTypeInfo(insight.type);
          return (
            <View key={insight.id} style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: typeInfo.color + '20' }]}>
                <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                {insight.guidelines && (
                  <Text style={styles.insightGuideline}>💡 {insight.guidelines}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderQuickActions = () => {
    return (
      <View style={styles.quickActions}>
        <AnimatedButton
          title="📅 ดูปฏิทิน"
          onPress={() => navigation.navigate('MaintenanceCalendar')}
          variant="secondary"
          size="medium"
        />
        <AnimatedButton
          title="➕ เพิ่มกิจกรรม"
          onPress={() => navigation.navigate('AddMaintenanceTask')}
          variant="primary"
          size="medium"
        />
      </View>
    );
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
          <Text style={styles.sectionLabel}>MAINTENANCE DASHBOARD</Text>
          <Text style={styles.title}>แผงควบคุมการดูแล</Text>
          <Text style={styles.subtitle}>
            ภาพรวมกิจกรรมดูแลสวนกาแฟทั้งหมด
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <SkeletonLoader width="100%" height={120} borderRadius={radius.lg} style={{ marginBottom: spacing.lg }} />
              <SkeletonLoader width="100%" height={200} borderRadius={radius.lg} />
            </View>
          ) : (
            <>
              {/* Summary Cards */}
              {renderSummaryCards()}

              {/* Upcoming Tasks */}
              {renderUpcomingTasks()}

              {/* Overdue Tasks */}
              {renderOverdueTasks()}

              {/* Seasonal Insights */}
              {renderSeasonalInsights()}

              {/* Quick Actions */}
              {renderQuickActions()}
            </>
          )}
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

  // Loading
  loadingContainer: { gap: spacing.lg },

  // Summary Cards
  summaryCards: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderLight, ...shadows.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.sizes.xl, fontWeight: '700', color: colors.text,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
  },
  seeAll: {
    fontSize: typography.sizes.sm, color: colors.primary, fontWeight: '600',
  },

  // Task Items
  taskItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  overdueTaskItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    backgroundColor: colors.error + '5',
  },
  taskIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  taskContent: { flex: 1 },
  taskTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  taskFarm: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  taskDate: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  overdueText: {
    fontSize: typography.sizes.xs, color: colors.error, fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm,
    minWidth: 24, alignItems: 'center',
  },
  priorityText: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textOnPrimary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center', padding: spacing.xl, gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
  },
  emptyText: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 18,
  },

  // Seasonal Insights
  insightItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  insightIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  insightContent: { flex: 1 },
  insightTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  insightDescription: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
    lineHeight: 16, marginBottom: spacing.xs,
  },
  insightGuideline: {
    fontSize: typography.sizes.xs, color: colors.textLight,
    lineHeight: 14,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl,
  },
});
