import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { CommunityStackParamList } from '../../types/navigation';
import { CommunityService } from '../../lib/community/communityService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'CreatePost'>;
};

const POST_TYPES = [
  { key: 'question', label: 'ถาม-ตอบ', icon: 'help-circle', color: COLORS.warning },
  { key: 'share', label: 'แชร์ประสบการณ์', icon: 'share-social', color: COLORS.info },
  { key: 'tips', label: 'เทคนิค/ความรู้', icon: 'bulb', color: COLORS.success },
  { key: 'market', label: 'ซื้อ-ขาย', icon: 'storefront', color: COLORS.primary },
];

const POPULAR_TAGS = [
  'กาแฟ', 'อาราบิก้า', 'โรบัสต้า', 'สวนกาแฟ', 'เกษตรอินทรีย์',
  'ปลูกกาแฟ', 'เก็บเกี่ยว', 'คั่วกาแฟ', 'ดอย', 'ภาคเหนือ',
  'ภาคอีสาน', 'ราคากาแฟ', 'ตลาดกาแฟ', 'ส่งออก', 'Barista'
];

export const CreatePostScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<typeof POST_TYPES[0]['key']>('share');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => setImage(null);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const tag = customTag.trim().replace(/^#/, '');
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
      setCustomTag('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('กรุณาใส่หัวข้อ', 'หัวข้อโพสต์ไม่ควรว่าง');
      return;
    }
    if (!content.trim() || content.length < 10) {
      Alert.alert('กรุณาใส่รายละเอียด', 'รายละเอียดควรมีอย่างน้อย 10 ตัวอักษร');
      return;
    }
    if (!user) {
      Alert.alert('กรุณาเข้าสู่ระบบ', 'คุณต้องเข้าสู่ระบบก่อนโพสต์');
      return;
    }

    setLoading(true);
    try {
      await CommunityService.createPost(user.uid, user.displayName || 'Unknown', 'กรุงเทพฯ', {
        title: title.trim(),
        content: content.trim(),
        image_url: image || undefined,
        post_type: selectedType,
        tags: selectedTags,
      });

      Alert.alert('สำเร็จ', 'โพสต์ของคุณถูกสร้างแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถสร้างโพสต์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สร้างโพสต์</Text>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'กำลังโพสต์...' : 'โพสต์'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>ประเภทโพสต์</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeContainer}
          >
            {POST_TYPES.map(type => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeCard,
                  selectedType === type.key && { borderColor: type.color, backgroundColor: `${type.color}10` }
                ]}
                onPress={() => setSelectedType(type.key)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={24} 
                  color={selectedType === type.key ? type.color : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.typeLabel,
                  selectedType === type.key && { color: type.color, fontWeight: '600' }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>หัวข้อ</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="หัวข้อโพสต์ของคุณ..."
            placeholderTextColor={COLORS.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>

          <Text style={styles.sectionTitle}>รายละเอียด</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="แชร์ความรู้ คำถาม หรือประสบการณ์ของคุณ..."
            placeholderTextColor={COLORS.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.sectionTitle}>รูปภาพ (ไม่บังคับ)</Text>
          {image ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImage} onPress={removeImage}>
                <Ionicons name="close-circle" size={28} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={32} color={COLORS.textSecondary} />
              <Text style={styles.addImageText}>เพิ่มรูปภาพ</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>แท็ก (เลือกได้ 5 แท็ก)</Text>
          <View style={styles.tagsContainer}>
            {POPULAR_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag) && styles.tagChipSelected
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagChipText,
                  selectedTags.includes(tag) && styles.tagChipTextSelected
                ]}>
                  #{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customTagContainer}>
            <TextInput
              style={styles.customTagInput}
              placeholder="เพิ่มแท็กของคุณ..."
              placeholderTextColor={COLORS.textSecondary}
              value={customTag}
              onChangeText={setCustomTag}
              onSubmitEditing={addCustomTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addCustomTag}>
              <Ionicons name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {selectedTags.length > 0 && (
            <View style={styles.selectedTagsContainer}>
              <Text style={styles.selectedTagsLabel}>แท็กที่เลือก:</Text>
              <View style={styles.selectedTags}>
                {selectedTags.map(tag => (
                  <View key={tag} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => toggleTag(tag)}>
                      <Ionicons name="close" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  submitButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.white },
  content: { flex: 1, paddingHorizontal: SPACING.xl },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  typeContainer: { gap: SPACING.sm, paddingVertical: SPACING.xs },
  typeCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    minWidth: 100,
  },
  typeLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  titleInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  charCount: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'right', marginTop: SPACING.xs },
  contentInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    minHeight: 150,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
  },
  addImageText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm },
  imagePreview: { position: 'relative' },
  previewImage: { width: '100%', height: 200, borderRadius: RADIUS.lg },
  removeImage: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tagChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, backgroundColor: COLORS.white, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderLight },
  tagChipSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tagChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  tagChipTextSelected: { color: COLORS.primary, fontWeight: '500' },
  customTagContainer: { flexDirection: 'row', marginTop: SPACING.md, gap: SPACING.sm },
  customTagInput: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, fontSize: FONTS.sizes.md, borderWidth: 1, borderColor: COLORS.borderLight },
  addTagButton: { width: 44, height: 44, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  selectedTagsContainer: { marginTop: SPACING.lg },
  selectedTagsLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  selectedTags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  selectedTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, gap: 4 },
  selectedTagText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '500' },
  bottomSpacer: { height: 100 },
});

export default CreatePostScreen;
