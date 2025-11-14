import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useData } from '../context/DataContext.js';
import EmptyState from '../components/EmptyState.js';
import ScreenWrapper from '../components/ScreenWrapper.js';
import theme from '../theme/colors.js';
import { getPlayerImage } from '../constants/media.js';

const roles = ['referee', 'player', 'fan', 'admin'];

const PeopleScreen = () => {
    const { users, refresh, loading } = useData();
    const [activeRole, setActiveRole] = useState('referee');

    const filteredUsers = users?.filter((user) => user.role === activeRole) || [];

  const renderItem = ({ item, index }) => (
        <View style={styles.card}>
      <Image
        source={item.avatar_url || getPlayerImage(index)}
        placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
        style={styles.avatar}
        contentFit="cover"
        cachePolicy="disk"
      />
            <View style={styles.body}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.meta}>{item.team_name || '—'}</Text>
                <Text style={styles.meta}>{item.phone || 'No contact'}</Text>
            </View>
        </View>
    );

  return (
    <ScreenWrapper scrollable={false}>
            <View style={styles.roleRow}>
                {roles.map((role) => (
                    <TouchableOpacity key={role} style={[styles.roleChip, activeRole === role && styles.roleChipActive]} onPress={() => setActiveRole(role)}>
                        <Text style={[styles.roleLabel, activeRole === role && styles.roleLabelActive]}>{role}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredUsers}
        keyExtractor={(item, index) => `${activeRole}-${item.id}-${index}`}
                renderItem={renderItem}
                ListEmptyComponent={
                    <EmptyState icon="people" title={`No ${activeRole}s`} subtitle="Central PHP system will sync registered profiles automatically." />
                }
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={filteredUsers.length ? styles.list : styles.emptyList}
            />
    </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    roleRow: {
        flexDirection: 'row',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8
    },
    roleChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 16
    },
    roleChipActive: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary
    },
    roleLabel: {
        textTransform: 'capitalize',
        fontWeight: '600',
    color: theme.colors.muted
    },
    roleLabelActive: {
    color: theme.colors.textPrimary
    },
    card: {
        flexDirection: 'row',
    backgroundColor: theme.colors.surface,
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
    elevation: 2
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12
    },
    body: {
        flex: 1
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    color: theme.colors.darkGray
    },
    meta: {
        fontSize: 13,
    color: theme.colors.muted
    },
    list: {
        paddingBottom: 20
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center'
    }
});

export default PeopleScreen;

