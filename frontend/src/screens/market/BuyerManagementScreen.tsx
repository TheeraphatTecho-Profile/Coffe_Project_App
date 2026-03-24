import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { Logo } from '../../components/Logo';
import { MarketService, Buyer, COFFEE_GRADES, CERTIFICATIONS } from '../../lib/marketService';
import { useAuth } from '../../context/AuthContext';

interface RouteParams {
  buyerId?: string;
}

export const BuyerManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const { buyerId } = route.params as RouteParams || {};
  
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    type: 'local' as Buyer['type'],
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    postalCode: '',
    website: '',
    lineId: '',
    facebook: '',
    specialties: [] as string[],
    priceRange: { min: 0, max: 0, currency: 'THB' },
    volumeCapacity: { min: 0, max: 0 },
    reliability: 'good' as Buyer['reliability'],
    notes: '',
  });

  useEffect(() => {
    loadBuyers();
    if (buyerId) {
      loadBuyerDetail();
    }
  }, [buyerId]);

  const loadBuyers = async () => {
    try {
      if (user?.uid) {
        const buyersData = await MarketService.getAllBuyers(user.uid);
        setBuyers(buyersData);
      }
    } catch (error) {
      console.error('Error loading buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerDetail = async () => {
    if (!buyerId || !user?.uid) return;
    
    try {
      const allBuyers = await MarketService.getAllBuyers(user.uid);
      const buyer = allBuyers.find(b => b.id === buyerId);
      if (buyer) {
        setEditingBuyer(buyer);
        setFormData({
          name: buyer.name,
          company: buyer.company,
          type: buyer.type,
          contactPerson: buyer.contactPerson,
          phone: buyer.phone,
          email: buyer.email,
          address: buyer.address,
          province: buyer.province,
          district: buyer.district,
          postalCode: buyer.postalCode,
          website: buyer.website || '',
          lineId: buyer.lineId || '',
          facebook: buyer.facebook || '',
          specialties: buyer.specialties,
          priceRange: buyer.priceRange,
          volumeCapacity: buyer.volumeCapacity,
          reliability: buyer.reliability,
          notes: buyer.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading buyer detail:', error);
    }
  };

  const handleSaveBuyer = async () => {
    if (!user?.uid) return;
    
    try {
      const buyerData = {
        userId: user.uid,
        ...formData,
        qualityRequirements: [
          {
            grade: 'A' as const,
            moistureContent: { min: 10, max: 12 },
            defects: { max: 2 },
            beanSize: 18,
            processing: 'washed' as const,
            description: 'คุณภาพสูงสุด',
          },
        ],
        paymentTerms: [
          {
            type: 'bank_transfer' as const,
            period: 30,
            discount: 2,
            description: 'โอนเงินภายใน 30 วัน ลด 2% หากชำระเงินภายใน 7 วัน',
          },
        ],
        certifications: [],
        preferredRegions: ['เลย', 'ขอนแก่น'],
        isActive: true,
      };

      if (editingBuyer?.id) {
        await MarketService.updateBuyer(editingBuyer.id, buyerData);
      } else {
        await MarketService.createBuyer(buyerData);
      }

      setShowAddModal(false);
      setEditingBuyer(null);
      resetForm();
      await loadBuyers();
      
      Alert.alert(
        'สำเร็จ',
        editingBuyer ? 'แก้ไขข้อมูลผู้ซื้อเรียบร้อยแล้ว' : 'เพิ่มผู้ซื้อใหม่เรียบร้อยแล้ว',
        [{ text: 'ตกลง' }]
      );
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่');
    }
  };

  const handleDeleteBuyer = async (buyerId: string) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบข้อมูลผู้ซื้อรายนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await MarketService.deleteBuyer(buyerId);
              await loadBuyers();
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      type: 'local',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      province: '',
      district: '',
      postalCode: '',
      website: '',
      lineId: '',
      facebook: '',
      specialties: [],
      priceRange: { min: 0, max: 0, currency: 'THB' },
      volumeCapacity: { min: 0, max: 0 },
      reliability: 'good',
      notes: '',
    });
  };

  const handleAddSpecialty = (specialty: string) => {
    if (!formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const getBuyerTypeInfo = (type: Buyer['type']) => {
    const typeInfo = {
      local: { icon: 'storefront', color: '#3498DB', label: 'ท้องถิ่น' },
      regional: { icon: 'map', color: '#9B59B6', label: 'ภูมิภาค' },
      national: { icon: 'flag', color: '#E67E22', label: 'ประเทศ' },
      international: { icon: 'globe', color: '#16A085', label: 'ต่างประเทศ' },
      cooperative: { icon: 'people', color: '#27AE60', label: 'สหกรณ์' },
      processor: { icon: 'cog', color: '#F39C12', label: 'โรงงาน' },
      roaster: { icon: 'cafe', color: '#8E44AD', label: 'คาเฟ่' },
      exporter: { icon: 'ship', color: '#2C3E50', label: 'ส่งออก' },
    };
    return typeInfo[type] || typeInfo.local;
  };

  const getReliabilityColor = (reliability: Buyer['reliability']) => {
    const colors = {
      excellent: '#27AE60',
      good: '#3498DB',
      average: '#F39C12',
      poor: '#E74C3C',
    };
    return colors[reliability];
  };

  const getReliabilityLabel = (reliability: Buyer['reliability']) => {
    const labels = {
      excellent: 'ดีเยี่ยม',
      good: 'ดี',
      average: 'ปานกลาง',
      poor: 'แย่',
    };
    return labels[reliability];
  };

  const filteredBuyers = buyers.filter(buyer => {
    const searchMatch = searchQuery === '' || 
      buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    
    const typeMatch = filterType === 'all' || buyer.type === filterType;
    
    return searchMatch && typeMatch;
  });

  const renderBuyerCard = (buyer: Buyer) => {
    const typeInfo = getBuyerTypeInfo(buyer.type);
    
    return (
      <TouchableOpacity
        key={buyer.id}
        style={styles.buyerCard}
        onPress={() => navigation.navigate('BuyerDetail', { buyerId: buyer.id })}
      >
        <View style={styles.buyerHeader}>
          <View style={styles.buyerTitleRow}>
            <View style={[styles.buyerIcon, { backgroundColor: typeInfo.color + '20' }]}>
              <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
            </View>
            <View style={styles.buyerTitleContent}>
              <Text style={styles.buyerName}>{buyer.company}</Text>
              <Text style={styles.buyerContact}>{buyer.contactPerson}</Text>
            </View>
            <View style={[styles.reliabilityBadge, { backgroundColor: getReliabilityColor(buyer.reliability) }]}>
              <Text style={styles.reliabilityText}>{getReliabilityLabel(buyer.reliability)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buyerInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>{buyer.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>{buyer.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>{buyer.province}</Text>
          </View>
        </View>

        {buyer.specialties.length > 0 && (
          <View style={styles.specialtiesContainer}>
            {buyer.specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.specialtyChip}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
            {buyer.specialties.length > 3 && (
              <Text style={styles.moreSpecialties}>+{buyer.specialties.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.buyerFooter}>
          <View style={styles.priceRange}>
            <Text style={styles.priceLabel}>ช่วงราคา:</Text>
            <Text style={styles.priceValue}>
              ฿{buyer.priceRange.min} - {buyer.priceRange.max}/{buyer.priceRange.currency}
            </Text>
          </View>
          <View style={styles.buyerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setEditingBuyer(buyer);
                setFormData({
                  name: buyer.name,
                  company: buyer.company,
                  type: buyer.type,
                  contactPerson: buyer.contactPerson,
                  phone: buyer.phone,
                  email: buyer.email,
                  address: buyer.address,
                  province: buyer.province,
                  district: buyer.district,
                  postalCode: buyer.postalCode,
                  website: buyer.website || '',
                  lineId: buyer.lineId || '',
                  facebook: buyer.facebook || '',
                  specialties: buyer.specialties,
                  priceRange: buyer.priceRange,
                  volumeCapacity: buyer.volumeCapacity,
                  reliability: buyer.reliability,
                  notes: buyer.notes || '',
                });
                setShowAddModal(true);
              }}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => buyer.id && handleDeleteBuyer(buyer.id)}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setShowAddModal(false);
            setEditingBuyer(null);
            resetForm();
          }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingBuyer ? 'แก้ไขผู้ซื้อ' : 'เพิ่มผู้ซื้อใหม่'}
          </Text>
          <View style={styles.modalHeaderRight} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>ข้อมูลพื้นฐาน</Text>
            
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>ชื่อบริษัท *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.company}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
                  placeholder="ชื่อบริษัท"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>ประเภท *</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    Alert.alert(
                      'เลือกประเภท',
                      '',
                      [
                        { text: 'ท้องถิ่น', onPress: () => setFormData(prev => ({ ...prev, type: 'local' })) },
                        { text: 'ภูมิภาค', onPress: () => setFormData(prev => ({ ...prev, type: 'regional' })) },
                        { text: 'ประเทศ', onPress: () => setFormData(prev => ({ ...prev, type: 'national' })) },
                        { text: 'ต่างประเทศ', onPress: () => setFormData(prev => ({ ...prev, type: 'international' })) },
                        { text: 'สหกรณ์', onPress: () => setFormData(prev => ({ ...prev, type: 'cooperative' })) },
                        { text: 'โรงงาน', onPress: () => setFormData(prev => ({ ...prev, type: 'processor' })) },
                        { text: 'คาเฟ่', onPress: () => setFormData(prev => ({ ...prev, type: 'roaster' })) },
                        { text: 'ส่งออก', onPress: () => setFormData(prev => ({ ...prev, type: 'exporter' })) },
                      ]
                    );
                  }}
                >
                  <Text style={styles.selectButtonText}>{getBuyerTypeInfo(formData.type).label}</Text>
                  <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>ชื่อผู้ติดต่อ *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.contactPerson}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, contactPerson: text }))}
                  placeholder="ชื่อผู้ติดต่อ"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>โทรศัพท์ *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="โทรศัพท์"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <Text style={styles.formLabel}>อีเมล *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="อีเมล"
              keyboardType="email-address"
            />

            <Text style={styles.formLabel}>ที่อ *</Text>
            <TextInput
              style={styles.formInput}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="ที่อ"
              multiline
            />
          </View>

          {/* Price and Volume */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>ราคาและปริมาณ</Text>
            
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>ราคาขั้นต่ำ (บาท/กก.)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.priceRange.min.toString()}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, min: parseFloat(text) || 0 }
                  }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>ราคาขั้นสูง (บาท/กก.)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.priceRange.max.toString()}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, max: parseFloat(text) || 0 }
                  }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>ปริมาณขั้นต่ำ (กก./เดือน)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.volumeCapacity.min.toString()}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    volumeCapacity: { ...prev.volumeCapacity, min: parseFloat(text) || 0 }
                  }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>ปริมาณขั้นสูง (กก./เดือน)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.volumeCapacity.max.toString()}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    volumeCapacity: { ...prev.volumeCapacity, max: parseFloat(text) || 0 }
                  }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Specialties */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>ประเภทกาแฟที่สนใจซื้อ</Text>
            
            <View style={styles.formSpecialtiesContainer}>
              {['Arabica', 'Robusta', 'กาแฟพรีเมียม', 'กาแฟคั่วดี', 'กาแฟอินทรีย์', 'กาแฟแปรระสาหร่า'].map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.specialtyOption,
                    formData.specialties.includes(specialty) && styles.specialtyOptionSelected
                  ]}
                  onPress={() => {
                    if (formData.specialties.includes(specialty)) {
                      handleRemoveSpecialty(specialty);
                    } else {
                      handleAddSpecialty(specialty);
                    }
                  }}
                >
                  <Text style={[
                    styles.specialtyOptionText,
                    formData.specialties.includes(specialty) && styles.specialtyOptionTextSelected
                  ]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reliability */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>ความน่าเชื่อวัด</Text>
            
            <View style={styles.reliabilityOptions}>
              {(['excellent', 'good', 'average', 'poor'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.reliabilityOption,
                    formData.reliability === level && styles.reliabilityOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, reliability: level }))}
                >
                  <View style={[
                    styles.reliabilityDot,
                    { backgroundColor: getReliabilityColor(level) }
                  ]} />
                  <Text style={[
                    styles.reliabilityOptionText,
                    formData.reliability === level && styles.reliabilityOptionTextSelected
                  ]}>
                    {getReliabilityLabel(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>บันทึกช่วย</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="บันทึกช่วยเกี่ยวกับผู้ซื้อ"
              multiline
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <AnimatedButton
            title={editingBuyer ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ซื้อ'}
            onPress={handleSaveBuyer}
            variant="primary"
            size="large"
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

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
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Section Title */}
          <Text style={styles.sectionLabel}>BUYER MANAGEMENT</Text>
          <Text style={styles.title}>จัดการผู้ซื้อ</Text>
          <Text style={styles.subtitle}>
            เพิ่มและจัดการข้อมูลผู้ซื้อกาแฟเพื่อเพิ่มช่องทางการตลาด
          </Text>

          {/* Search and Filter */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="ค้นหาผู้ซื้อ..."
              />
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'local', 'regional', 'national', 'international', 'cooperative', 'processor', 'roaster', 'exporter'].map((type) => (
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
                    {type === 'all' ? 'ทั้งหมด' : getBuyerTypeInfo(type as Buyer['type']).label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Buyers List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={{ width: '100%', height: 120, borderRadius: radius.lg, backgroundColor: colors.borderLight, marginBottom: spacing.md }} />
              ))}
            </View>
          ) : filteredBuyers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyTitle}>ไม่มีผู้ซื้อ</Text>
              <Text style={styles.emptyText}>
                {searchQuery || filterType !== 'all' 
                  ? 'ไม่พบผู้ซื้อตามเงื่อนไขที่ค้นหา' 
                  : 'เริ่มต้นโดยการเพิ่มผู้ซื้อคนแรก'
                }
              </Text>
              <AnimatedButton
                title="เพิ่มผู้ซื้อใหม่"
                onPress={() => setShowAddModal(true)}
                variant="primary"
                size="large"
              />
            </View>
          ) : (
            <View style={styles.buyersList}>
              {filteredBuyers.map(renderBuyerCard)}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Add/Edit Modal */}
      {renderAddModal()}
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

  // Search and Filter
  searchFilterContainer: { marginBottom: spacing.xl },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1, marginLeft: spacing.sm, fontSize: typography.sizes.md, color: colors.text,
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

  // Buyers List
  buyersList: { gap: spacing.md },
  buyerCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight,
    ...shadows.sm,
  },
  buyerHeader: {
    marginBottom: spacing.sm,
  },
  buyerTitleRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
  },
  buyerIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  buyerTitleContent: { flex: 1 },
  buyerName: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  buyerContact: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
  },
  reliabilityBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm,
  },
  reliabilityText: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textOnPrimary,
  },
  buyerInfo: {
    gap: spacing.xs, marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm, color: colors.text,
  },
  specialtiesContainer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  specialtyChip: {
    backgroundColor: colors.primary + '10', borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  specialtyText: {
    fontSize: typography.sizes.xs, color: colors.primary,
  },
  moreSpecialties: {
    fontSize: typography.sizes.xs, color: colors.textLight,
    marginLeft: spacing.xs,
  },
  buyerFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  priceRange: {
    flex: 1,
  },
  priceLabel: {
    fontSize: typography.sizes.xs, color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text,
  },
  buyerActions: {
    flexDirection: 'row', gap: spacing.sm,
  },
  editButton: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
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

  // Modal
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text,
  },
  modalHeaderRight: { width: 24 },
  modalContent: {
    flex: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
  },
  modalFooter: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },

  // Form
  formSection: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.lg,
  },
  formRow: {
    flexDirection: 'row', gap: spacing.md,
  },
  formHalf: {
    flex: 1,
  },
  formLabel: {
    fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text,
    marginBottom: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: typography.sizes.md, color: colors.text,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  formTextArea: {
    height: 80, textAlignVertical: 'top',
  },
  selectButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  selectButtonText: {
    fontSize: typography.sizes.md, color: colors.text,
  },

  // Specialties (form)
  formSpecialtiesContainer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  specialtyOption: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  specialtyOptionSelected: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  specialtyOptionText: {
    fontSize: typography.sizes.sm, color: colors.text,
  },
  specialtyOptionTextSelected: {
    color: colors.textOnPrimary,
  },

  // Reliability
  reliabilityOptions: {
    gap: spacing.sm,
  },
  reliabilityOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.sm, borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  reliabilityOptionSelected: {
    borderColor: colors.primary,
  },
  reliabilityDot: {
    width: 12, height: 12, borderRadius: 6,
  },
  reliabilityOptionText: {
    fontSize: typography.sizes.sm, color: colors.text,
  },
  reliabilityOptionTextSelected: {
    fontWeight: '600',
  },
});
