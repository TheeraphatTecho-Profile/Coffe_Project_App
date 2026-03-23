import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SocialService, UserProfile } from '../../lib/socialService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: any;
};

export const SearchUsersScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [suggested, setSuggested] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSuggested = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await SocialService.getSuggestedUsers(user.uid, 20);
      setSuggested(data);
    } catch (error) {
      console.error('Error loading suggested users:', error);
    }
  }, [user]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const results = await SocialService.searchUsers(query, 30);
      // Filter out current user
      const filtered = results.filter(u => u.uid !== user?.uid);
      setUsers(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuggested();
    setRefreshing(false);
  };

  React.useEffect(() => {
    loadSuggested();
  }, [loadSuggested]);

  const renderUser = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigation.navigate('UserProfile', { userId: item.uid })}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.display_name?.charAt(0) || item.name?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.display_name || item.name || 'Unknown'}</Text>
        {item.province && <Text style={styles.userMeta}>{item.province}</Text>}
        <View style={styles.userStats}>
          <Text style={styles.userStatText}>{item.posts_count || 0} โพสต์</Text>
          <Text style={styles.userStatDot}>•</Text>
          <Text style={styles.userStatText}>{item.followers_count || 0} ผู้ติดตาม</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.followButton}
        onPress={() => {/* TODO: Quick follow */}}
      >
        <Ionicons name="person-add" size={18} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {searchQuery.length === 0 && suggested.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>แนะนำให้ติดตาม</Text>
        </View>
      )}
      {searchQuery.length > 0 && users.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ผลการค้นหา ({users.length})</Text>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      {searchQuery.length >= 2 ? (
        <>
          <Ionicons name="search-outline" size={48} color={COLORS.borderLight} />
          <Text style={styles.emptyTitle}>ไม่พบผู้ใช้</Text>
          <Text style={styles.emptyText}>ลองค้นหาด้วยชื่อหรือจังหวัดอื่น</Text>
        </>
      ) : (
        <Text style={styles.emptyHint}>พิมพ์ชื่อหรือจังหวัดเพื่อค้นหาเกษตรกร</Text>
      )}
    </View>
  );

  const displayData = searchQuery.length >= 2 ? users : suggested;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ค้นหาเกษตรกร</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาชื่อ หรือจังหวัด..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayData}
        keyExtractor={item => item.uid}
        renderItem={renderUser}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.xl,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  listContent: { paddingHorizontal: SPACING.xl, flexGrow: 1 },
  section: { paddingVertical: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textSecondary },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatarContainer: { marginRight: SPACING.md },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white },
  userInfo: { flex: 1 },
  userName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  userMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  userStats: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  userStatText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  userStatDot: { marginHorizontal: 4, color: COLORS.textSecondary },
  followButton: { width: 36, height: 36, backgroundColor: COLORS.primaryLight, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text, marginTop: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: 4 },
  emptyHint: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
});

export default SearchUsersScreen;
