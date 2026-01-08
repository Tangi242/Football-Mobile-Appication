import { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../../context/DataContext.js';
import EmptyState from '../../components/ui/EmptyState.js';
import ScreenWrapper from '../../components/ui/ScreenWrapper.js';
import SearchBar from '../../components/ui/SearchBar.js';
import theme from '../../theme/colors.js';
import { getPlayerImage } from '../../constants/media.js';

const roles = ['referee', 'player', 'fan', 'admin', 'coach', 'journalist', 'club_manager'];

const PeopleScreen = () => {
    const { users, refresh, loading } = useData();
    const [activeRole, setActiveRole] = useState('referee');
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

    const filteredUsers = useMemo(() => {
        let filtered = users?.filter((user) => user.role === activeRole) || [];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((user) =>
                user.full_name?.toLowerCase().includes(query) ||
                user.team_name?.toLowerCase().includes(query) ||
                user.phone?.includes(query)
            );
        }
        return filtered;
    }, [users, activeRole, searchQuery]);

    const renderItem = ({ item, index }) => {
        const isPlayer = activeRole === 'player';
        const handlePress = () => {
            if (isPlayer && item.full_name) {
                navigation.navigate('PlayerDetail', { playerName: item.full_name });
            }
        };

        const CardComponent = isPlayer ? TouchableOpacity : View;
        const cardProps = isPlayer ? { onPress: handlePress, activeOpacity: 0.7 } : {};

        return (
            <CardComponent style={styles.card} {...cardProps}>
                <Image
                    source={item.avatar_url || getPlayerImage(index)}
                    placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                    style={styles.avatar}
                    contentFit="cover"
                    cachePolicy="disk"
                />
                <View style={styles.body}>
                    <Text style={styles.name}>{item.full_name}</Text>
                    {item.team_name && (
                        <Text style={styles.meta}>{item.team_name}</Text>
                    )}
                    {item.phone && (
                        <Text style={styles.meta}>{item.phone}</Text>
                    )}
                    {item.email && (
                        <Text style={styles.meta}>{item.email}</Text>
                    )}
                </View>
            </CardComponent>
        );
    };

    return (
        <ScreenWrapper scrollable={false}>
            <SearchBar
                placeholder={`Search ${activeRole}s...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <View style={styles.roleRow}>
                {roles.map((role) => (
                    <TouchableOpacity
                        key={role}
                        style={[styles.roleChip, activeRole === role && styles.roleChipActive]}
                        onPress={() => {
                            setActiveRole(role);
                            setSearchQuery('');
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.roleLabel, activeRole === role && styles.roleLabelActive]}>{role}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {loading && filteredUsers.length === 0 ? (
                <View style={styles.skeletonContainer}>
                    <LoadingSkeleton type="list" count={6} />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item, index) => `${activeRole}-${item.id}-${index}`}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <EmptyState
                                icon="people"
                                title={searchQuery ? `No ${activeRole}s found` : `No ${activeRole}s yet`}
                                subtitle={searchQuery ? "No results match your search. Try a different search term, check your spelling, or clear your search to see all available profiles." : `Registered ${activeRole} profiles will sync automatically from the central system. This includes contact information, team affiliations, and role-specific details. Check back soon for updates!`}
                            />
                        </View>
                    }
                    refreshControl={<RefreshControl refreshing={loading && filteredUsers.length > 0} onRefresh={refresh} />}
                    contentContainerStyle={filteredUsers.length ? styles.list : styles.emptyList}
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    roleRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.lg,
        flexWrap: 'wrap',
        gap: theme.spacing.sm
    },
    roleChip: {
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing.xs + 2,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.sm
    },
    roleChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        ...theme.shadows.md
    },
    roleLabel: {
        textTransform: 'capitalize',
        ...theme.typography.bodySmall,
        fontWeight: '600',
        color: theme.colors.muted
    },
    roleLabelActive: {
        color: theme.colors.white,
        fontWeight: '700'
    },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.md
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: theme.spacing.md,
        borderWidth: 2,
        borderColor: theme.colors.border
    },
    body: {
        flex: 1
    },
    name: {
        ...theme.typography.body,
        fontWeight: '700',
        color: theme.colors.darkGray,
        marginBottom: theme.spacing.xs / 2
    },
    meta: {
        ...theme.typography.caption,
        color: theme.colors.muted,
        marginTop: theme.spacing.xs / 2
    },
    list: {
        paddingBottom: theme.spacing.md
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingTop: 60
    },
    emptyContainer: {
        paddingVertical: theme.spacing.lg
    },
    skeletonContainer: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.md
    }
});

export default PeopleScreen;

