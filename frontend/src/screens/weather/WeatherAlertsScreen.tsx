import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Logo } from '../../components/Logo';
import { WeatherAlertService, WeatherAlert, LOEI_WEATHER_THRESHOLDS } from '../../lib/weatherAlertService';
import { useAuth } from '../../context/AuthContext';
import { Farm, FarmService } from '../../lib/firebaseDb';

export const WeatherAlertsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedFarm, filterType, filterSeverity]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [alertsData, farmsData] = await Promise.all([
        WeatherAlertService.getAllAlerts(user.uid),
        FarmService.getAll(user.uid)
      ]);
      
      setAlerts(alertsData);
      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading weather alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [selectedFarm, filterType, filterSeverity]);

  const getAlertTypeInfo = (type: WeatherAlert['type']) => {
    const typeInfo = {
      frost: { icon: 'snow', color: '#3498DB', label: 'ความหนาว' },
      heavy_rain: { icon: 'rainy', color: '#2980B9', label: 'ฝนหนัก' },
      storm: { icon: 'thunderstorm', color: '#8E44AD', label: 'พายุ' },
      drought: { icon: 'sunny', color: '#E67E22', label: 'ภัยแล้ง' },
      heat_wave: { icon: 'thermometer', color: '#E74C3C', label: 'คลื่นความร้อน' },
      cold_snap: { icon: 'snow', color: '#3498DB', label: 'คลื่นความหนาว' },
      wind: { icon: 'wind', color: '#95A5A6', label: 'ลมแรง' },
      humidity: { icon: 'water', color: '#16A085', label: 'ความชื้น' },
    };
    return typeInfo[type] || typeInfo.frost;
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    const colors = {
      low: '#27AE60',
      medium: '#F39C12',
      high: '#E67E22',
      extreme: '#E74C3C',
    };
    return colors[severity];
  };

  const getSeverityLabel = (severity: WeatherAlert['severity']) => {
    const labels = {
      low: 'ต่ำ',
      medium: 'ปานกลาง',
      high: 'สูง',
      extreme: 'รุนแรง',
    };
    return labels[severity];
  };

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.name || 'สวนไม่ระบุ';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await WeatherAlertService.markAlertAsRead(alertId);
      await loadData();
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบการแจ้งเตือนนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await WeatherAlertService.deleteAlert(alertId);
              await loadData();
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบการแจ้งเตือนได้');
            }
          },
        },
      ]
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    const farmMatch = selectedFarm === 'all' || alert.farmId === selectedFarm;
    const typeMatch = filterType === 'all' || alert.type === filterType;
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    return farmMatch && typeMatch && severityMatch;
  });

  const activeAlerts = filteredAlerts.filter(alert => alert.isActive);
  const unreadAlerts = filteredAlerts.filter(alert => !alert.isRead);

  const renderAlertCard = (alert: WeatherAlert) => {
    const typeInfo = getAlertTypeInfo(alert.type);
    const farmName = getFarmName(alert.farmId);
    
    return (
      <TouchableOpacity
        key={alert.id}
        style={[
          styles.alertCard,
          !alert.isRead && styles.unreadAlertCard,
          { borderLeftColor: getSeverityColor(alert.severity) }
        ]}
        onPress={() => {
          if (!alert.isRead && alert.id) {
            handleMarkAsRead(alert.id);
          }
          if (alert.id) {
            navigation.navigate('WeatherAlertDetail', { alertId: alert.id });
          }
        }}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertTitleRow}>
            <View style={[styles.alertIcon, { backgroundColor: typeInfo.color + '20' }]}>
              <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
            </View>
            <View style={styles.alertTitleContent}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertFarm}>📍 {farmName}</Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
              <Text style={styles.severityText}>{getSeverityLabel(alert.severity)}</Text>
            </View>
          </View>
          
          {!alert.isRead && (
            <View style={styles.unreadIndicator}>
              <View style={styles.unreadDot} />
            </View>
          )}
        </View>

        <Text style={styles.alertDescription}>{alert.description}</Text>
        
        <View style={styles.alertMeta}>
          <Text style={styles.alertTime}>⏰ {formatDateTime(alert.expectedTime)}</Text>
          <Text style={styles.alertDuration}>⏱️ {alert.expectedDuration} ชม.</Text>
        </View>

        <View style={styles.alertFooter}>
          <Text style={styles.alertArea}>📍 {alert.affectedArea}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              if (alert.id) {
                handleDeleteAlert(alert.id);
              }
            }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterChips = () => {
    const alertTypes = ['all', 'frost', 'heavy_rain', 'storm', 'heat_wave', 'wind'];
    const severities = ['all', 'low', 'medium', 'high', 'extreme'];
    
    return (
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>ประเภท:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {alertTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  filterType === type && styles.filterChipActive
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text style={[
                  styles.filterChipText,
                  filterType === type && styles.filterChipTextActive
                ]}>
                  {type === 'all' ? 'ทั้งหมด' : getAlertTypeInfo(type as WeatherAlert['type']).label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>ความรุนแรง:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {severities.map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.filterChip,
                  filterSeverity === severity && styles.filterChipActive
                ]}
                onPress={() => setFilterSeverity(severity)}
              >
                <Text style={[
                  styles.filterChipText,
                  filterSeverity === severity && styles.filterChipTextActive
                ]}>
                  {severity === 'all' ? 'ทั้งหมด' : severity === 'low' ? 'ต่ำ' : severity === 'medium' ? 'ปานกลาง' : severity === 'high' ? 'สูง' : 'รุนแรง'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
          <Text style={styles.sectionLabel}>WEATHER ALERTS</Text>
          <Text style={styles.title}>การแจ้งเตือนสภาพอากาศ</Text>
          <Text style={styles.subtitle}>
            ติดตามสภาพอากาศและรับการแจ้งเตือนสำหรับสวนกาแฟ
          </Text>

          {/* Summary Cards */}
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={styles.summaryLabel}>การแจ้งเตือนทั้งหมด</Text>
              <Text style={styles.summaryValue}>{filteredAlerts.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.warning} />
              <Text style={styles.summaryLabel}>กำลังดำเนินการ</Text>
              <Text style={styles.summaryValue}>{activeAlerts.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="mail-unread-outline" size={24} color={colors.error} />
              <Text style={styles.summaryLabel}>ยังไม่ได้อ่าน</Text>
              <Text style={styles.summaryValue}>{unreadAlerts.length}</Text>
            </View>
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

          {/* Filters */}
          {renderFilterChips()}

          {/* Alert List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLoader key={i} width="100%" height={120} borderRadius={radius.lg} style={{ marginBottom: spacing.md }} />
              ))}
            </View>
          ) : filteredAlerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyTitle}>ไม่มีการแจ้งเตือน</Text>
              <Text style={styles.emptyText}>
                ไม่พบการแจ้งเตือนตามเงื่อนไขที่เลือก
              </Text>
            </View>
          ) : (
            <View style={styles.alertList}>
              {filteredAlerts.map(renderAlertCard)}
            </View>
          )}

          {/* Action Button */}
          <AnimatedButton
            title="ตั้งค่าการแจ้งเตือน"
            onPress={() => navigation.navigate('WeatherAlertSettings')}
            variant="outline"
            size="large"
            icon={<Ionicons name="settings-outline" size={20} color={colors.secondary} />}
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

  // Summary Cards
  summaryCards: {
    flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderLight, ...shadows.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs, color: colors.textSecondary,
    marginBottom: spacing.xs, textAlign: 'center',
  },
  summaryValue: {
    fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text,
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

  // Filters
  filtersContainer: { marginBottom: spacing.xl },
  filterSection: { marginBottom: spacing.md },
  filterLabel: {
    fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderLight, marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm, color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
  },

  // Loading
  loadingContainer: { gap: spacing.md },

  // Alert List
  alertList: { gap: spacing.md },
  alertCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderLeftWidth: 4,
    borderWidth: 1, borderColor: colors.borderLight,
    ...shadows.sm,
  },
  unreadAlertCard: {
    backgroundColor: colors.primary + '5',
  },
  alertHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  alertTitleRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    flex: 1,
  },
  alertIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  alertTitleContent: { flex: 1 },
  alertTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  alertFarm: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm,
  },
  severityText: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textOnPrimary,
  },
  unreadIndicator: {
    alignItems: 'center', justifyContent: 'center',
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
  },
  alertDescription: {
    fontSize: typography.sizes.sm, color: colors.text,
    lineHeight: 18, marginBottom: spacing.sm,
  },
  alertMeta: {
    flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.sm,
  },
  alertTime: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  alertDuration: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  alertFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  alertArea: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  deleteButton: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.error + '20',
    alignItems: 'center', justifyContent: 'center',
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
