import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { Logo } from '../../components/Logo';
import { CostService, Cost, COST_CATEGORIES, CostCategory } from '../../lib/costService';
import { useAuth } from '../../context/AuthContext';
import { Farm, FarmService } from '../../lib/firebaseDb';

interface RouteParams {
  farmId?: string;
  category?: Cost['category'];
}

export const AddCostScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const { farmId, category: initialCategory } = route.params as RouteParams || {};
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>(farmId || '');
  const [selectedCategory, setSelectedCategory] = useState<Cost['category']>(initialCategory || 'fertilizer');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      if (user?.uid) {
        const farmsData = await FarmService.getAll(user.uid);
        setFarms(farmsData);
        if (!farmId && farmsData.length > 0) {
          setSelectedFarm(farmsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading farms:', error);
    }
  };

  const getCategoryInfo = (categoryId: string): CostCategory => {
    return COST_CATEGORIES.find(cat => cat.id === categoryId) || COST_CATEGORIES[0];
  };

  const calculateTotal = (): number => {
    const amt = parseFloat(amount) || 0;
    const price = parseFloat(unitPrice) || 0;
    return amt * price;
  };

  const validateForm = (): boolean => {
    if (!selectedFarm) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกสวน');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรายละเอียด');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกจำนวนที่ถูกต้อง');
      return false;
    }
    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกราคาหน่วยที่ถูกต้อง');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.uid) return;

    setLoading(true);
    try {
      const costData = {
        userId: user.uid,
        farmId: selectedFarm,
        category: selectedCategory,
        description: description.trim(),
        amount: parseFloat(amount),
        unitPrice: parseFloat(unitPrice),
        unit: getCategoryInfo(selectedCategory).unit as Cost['unit'],
        date,
      };

      await CostService.createCost(costData);
      
      Alert.alert(
        'สำเร็จ',
        'บันทึกต้นทุนเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'เพิ่มอีก',
            onPress: () => {
              setDescription('');
              setAmount('');
              setUnitPrice('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating cost:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกต้นทุนได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const styles = React.useMemo(() => createStyles(colors, spacing, typography, radius, shadows), [colors, spacing, typography, radius, shadows]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>เพิ่มต้นทุน</Text>
          <View style={styles.headerRight}>
            <Logo size="small" showText={false} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Farm Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เลือกสวน</Text>
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                style={[
                  styles.farmOption,
                  selectedFarm === farm.id && styles.farmOptionSelected
                ]}
                onPress={() => setSelectedFarm(farm.id)}
              >
                <View style={styles.farmOptionLeft}>
                  <Ionicons 
                    name="leaf" 
                    size={20} 
                    color={selectedFarm === farm.id ? colors.textOnPrimary : colors.primary} 
                  />
                  <Text style={[
                    styles.farmOptionText,
                    selectedFarm === farm.id && styles.farmOptionTextSelected
                  ]}>
                    {farm.name}
                  </Text>
                </View>
                {selectedFarm === farm.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.textOnPrimary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ประเภทต้นทุน</Text>
            <View style={styles.categoryGrid}>
              {COST_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category.id && styles.categoryOptionSelected,
                    { backgroundColor: selectedCategory === category.id ? category.color : colors.surface }
                  ]}
                  onPress={() => setSelectedCategory(category.id as Cost['category'])}
                >
                  <Ionicons 
                    name={category.icon as any} 
                    size={24} 
                    color={selectedCategory === category.id ? colors.textOnPrimary : category.color} 
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cost Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>รายละเอียดต้นทุน</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>รายละเอียด</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="เช่น ปุ๋ยยูเรีย 46-0-0"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.inputLabel}>
                  จำนวน ({getCategoryInfo(selectedCategory).unit})
                </Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                <Text style={styles.inputLabel}>ราคา/หน่วย (บาท)</Text>
                <TextInput
                  style={styles.input}
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>วันที่</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textLight}
              />
            </View>

            {/* Total Cost Display */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>ต้นทุนรวม</Text>
              <Text style={styles.totalValue}>฿{calculateTotal().toFixed(2)}</Text>
            </View>
          </View>

          {/* Submit Button */}
          <AnimatedButton
            title="บันทึกต้นทุน"
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            size="large"
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
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
  headerRight: { width: 32, height: 32 },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.text, marginBottom: spacing.md },

  // Farm Selection
  farmOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  farmOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  farmOptionLeft: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  farmOptionText: {
    fontSize: typography.sizes.md, fontWeight: '500', color: colors.text,
  },
  farmOptionTextSelected: {
    color: colors.textOnPrimary,
  },

  // Category Selection
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  categoryOption: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: '30%', aspectRatio: 1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  categoryOptionSelected: {
    borderWidth: 2,
  },
  categoryText: {
    fontSize: typography.sizes.xs, fontWeight: '500', color: colors.text,
    marginTop: spacing.xs, textAlign: 'center',
  },
  categoryTextSelected: {
    color: colors.textOnPrimary,
  },

  // Input Fields
  inputGroup: { marginBottom: spacing.md },
  inputLabel: {
    fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: typography.sizes.md, color: colors.text,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  inputRow: { flexDirection: 'row' },

  // Total Card
  totalCard: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    padding: spacing.lg, alignItems: 'center',
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  totalValue: {
    fontSize: typography.sizes.xl, fontWeight: '700', color: colors.textOnPrimary,
  },
});
