import { obtenerInvitacionesEquipo } from '@/services/invitaciones.service';
import { Invitacion } from '@/types/invitacion-types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SolicitudesEquipoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const equipoId = params.equipoId ? parseInt(params.equipoId as string) : null;

    const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        if (equipoId) {
            cargarInvitaciones(0, true);
        }
    }, [equipoId]);

    const cargarInvitaciones = async (pageNumber: number, shouldRefresh: boolean = false) => {
        if (!equipoId) return;

        try {
            if (pageNumber === 0) setLoading(true);
            else setLoadingMore(true);

            const response = await obtenerInvitacionesEquipo(equipoId, {
                page: pageNumber,
                size: 20,
                sort: ['fechaCreacion,desc'] // Ordenar por fecha descendente
            });

            if (shouldRefresh) {
                setInvitaciones(response.content);
            } else {
                setInvitaciones(prev => [...prev, ...response.content]);
            }

            setTotalElements(response.totalElements);
            setHasMore(!response.last);
            setPage(pageNumber);

        } catch (error) {
            console.error('Error al cargar invitaciones:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        cargarInvitaciones(0, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            cargarInvitaciones(page + 1);
        }
    };

    const renderInvitacionItem = ({ item }: { item: Invitacion }) => (
        <View style={styles.invitacionCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {item.usuarioRemitenteId.toString().slice(0, 2)}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>Usuario #{item.usuarioRemitenteId}</Text>
                        <Text style={styles.dateText}>
                            {new Date(item.fechaCreacion).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.estado === 'PENDIENTE' && styles.statusPendiente,
                    item.estado === 'ACEPTADA' && styles.statusAceptada,
                    item.estado === 'RECHAZADA' && styles.statusRechazada
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.estado === 'PENDIENTE' && styles.textPendiente,
                        item.estado === 'ACEPTADA' && styles.textAceptada,
                        item.estado === 'RECHAZADA' && styles.textRechazada
                    ]}>{item.estado}</Text>
                </View>
            </View>

            <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>Mensaje:</Text>
                <Text style={styles.messageText}>{item.mensaje || 'Sin mensaje'}</Text>
            </View>

            {item.estado === 'PENDIENTE' && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.actionButton, styles.rejectButton]}>
                        <Text style={styles.rejectButtonText}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.acceptButton]}>
                        <LinearGradient
                            colors={['#7033FF', '#B34CFF']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.acceptButtonText}>Aceptar</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Solicitudes de Unión</Text>
                <View style={styles.headerRight} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#7033FF" />
                </View>
            ) : (
                <FlatList
                    data={invitaciones}
                    renderItem={renderInvitacionItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#7033FF']} />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#7033FF" style={{ marginVertical: 20 }} /> : null}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="mail-open-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        width: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 30,
    },
    invitacionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#7033FF',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusPendiente: { backgroundColor: '#FFF4E5' },
    statusAceptada: { backgroundColor: '#E8F5E9' },
    statusRechazada: { backgroundColor: '#FFEBEE' },
    statusText: { fontSize: 12, fontWeight: '600' },
    textPendiente: { color: '#FF9800' },
    textAceptada: { color: '#4CAF50' },
    textRechazada: { color: '#F44336' },
    messageContainer: {
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    messageLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    rejectButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FF5252',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectButtonText: {
        color: '#FF5252',
        fontWeight: '600',
        fontSize: 14,
    },
    acceptButton: {
        backgroundColor: '#7033FF',
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
});
