import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาระบุชื่อ');
      return;
    }

    try {
      setLoading(true);
      // Note: Firebase profile update would go here
      // For now, just show success
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลโปรไฟล์เรียบร้อย');
      navigation.goBack();
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={COLORS.textLight} />
            </View>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>เปลี่ยนรูปโปรไฟล์</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อ-นามสกุล</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="กรุณาระบุชื่อ-นามสกุล"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>อีเมล</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="กรุณาระบุอีเมล"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>เบอร์โทรศัพท์</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="กรุณาระบุเบอร์โทรศัพท์"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Save button */}
          <Button 
            title="บันทึกการเปลี่ยนแปลง" 
            onPress={handleSave} 
            loading={loading}
            style={styles.saveButton}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xxl },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.surfaceWarm, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  changePhotoBtn: { paddingVertical: SPACING.sm },
  changePhotoText: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '600' },
  form: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.sm },
  input: { fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md },
  saveButton: { marginTop: SPACING.xl },
});
