import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'PrivacyPolicy'>;
  route: RouteProp<AuthStackParamList, 'PrivacyPolicy'>;
};

const POLICY_SECTIONS = [
  {
    title: '1. บทนำ',
    content:
      'สวนกาแฟเลย ("เรา") มีนโยบายรักษาความเป็นส่วนตัวของข้อมูลส่วนบุคคลของท่านตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) เราจะเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคลของท่านเฉพาะที่จำเป็นต่อการให้บริการเท่านั้น',
  },
  {
    title: '2. ข้อมูลที่เราจัดเก็บ',
    items: [
      {
        icon: 'person-outline' as const,
        label: 'ข้อมูลส่วนตัว',
        detail: 'ชื่อ นามสกุล, เบอร์โทร, ตำแหน่งงาน, เพศ/อายุ, ที่อยู่ติดต่อ',
      },
      {
        icon: 'location-outline' as const,
        label: 'ข้อมูลตำแหน่ง',
        detail: 'พิกัด GPS ของแปลงเกษตร, แผนที่ร้านค้า/จุดส่งสินค้า',
      },
      {
        icon: 'bar-chart-outline' as const,
        label: 'ข้อมูลการเกษตร',
        detail: 'ข้อมูลการเพาะปลูก, ผลผลิต, รายงานการใช้ปุ๋ย, สารป้องกันศัตรูพืช, และการเก็บเกี่ยว',
      },
      {
        icon: 'analytics-outline' as const,
        label: 'ข้อมูลธุรกรรม',
        detail: 'ประวัติการซื้อขาย, ราคา, ปริมาณ, ข้อมูลการชำระเงิน',
      },
    ],
  },
  {
    title: '3. วัตถุประสงค์การใช้ข้อมูล',
    content:
      'เราใช้ข้อมูลของท่านเพื่อ: ให้บริการแอปพลิเคชัน, วิเคราะห์ข้อมูลการเกษตร, แนะนำการดูแลสวนกาแฟ, แจ้งเตือนกิจกรรม, และปรับปรุงคุณภาพบริการ',
  },
  {
    title: '4. สิทธิของเจ้าของข้อมูล',
    content:
      'ท่านมีสิทธิตามกฎหมาย PDPA ในการดำเนินการ ดังนี้:',
    bullets: [
      'สิทธิในการเพิกถอนความยินยอม',
      'สิทธิในการขอเข้าถึงข้อมูลส่วนบุคคล',
      'สิทธิในการขอลบหรือทำลายข้อมูล',
      'สิทธิในการขอให้โอนย้ายข้อมูล',
    ],
  },
  {
    title: '5. ข้อมูลติดต่อ',
    content: 'เจ้าหน้าที่ผู้คุ้มครองข้อมูลส่วนตัว (DPO)',
    contact: {
      phone: '042-XXX-XXXX',
      email: 'dpo@coffee-loei.example',
    },
  },
];

/**
 * Privacy Policy / PDPA compliance screen.
 * Displays data collection and usage policies.
 * In 'accept' mode, shows accept/decline buttons.
 */
export const PrivacyPolicyScreen: React.FC<Props> = ({ navigation, route }) => {
  const mode = route.params?.mode ?? 'view';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>นโยบายความเป็นส่วนตัว</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PDPA COMPLIANCE</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>การคุ้มครองข้อมูลส่วนบุคคล</Text>
          <Text style={styles.updateDate}>
            ปรับปรุงล่าสุดวันที่: 12 ก.พ. 2567
          </Text>

          {POLICY_SECTIONS.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.content && (
                <Text style={styles.sectionContent}>{section.content}</Text>
              )}

              {section.items?.map((item, i) => (
                <View key={i} style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons name={item.icon} size={20} color={COLORS.secondary} />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoDetail}>{item.detail}</Text>
                  </View>
                </View>
              ))}

              {section.bullets?.map((bullet, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}

              {section.contact && (
                <View style={styles.contactCard}>
                  <View style={styles.contactRow}>
                    <Ionicons name="call" size={18} color={COLORS.primary} />
                    <Text style={styles.contactText}>{section.contact.phone}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Ionicons name="mail" size={18} color={COLORS.primary} />
                    <Text style={styles.contactText}>{section.contact.email}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Bottom actions */}
        {mode === 'accept' ? (
          <View style={styles.bottomActions}>
            <Button
              title="ไม่ยอมรับ"
              onPress={() => navigation.goBack()}
              variant="outline"
              fullWidth={false}
              style={styles.declineButton}
            />
            <Button
              title="ยอมรับ"
              onPress={() => navigation.goBack()}
              fullWidth={false}
              style={styles.acceptButton}
            />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  badgeRow: {
    paddingHorizontal: SPACING.xxl,
    marginBottom: SPACING.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.secondary,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  updateDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionContent: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  infoDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  bulletDot: {
    fontSize: FONTS.sizes.md,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  contactText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1,
  },
});
