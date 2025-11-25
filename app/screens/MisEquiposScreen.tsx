import { obtenerMisEquipos, obtenerUsuarioId } from '@/services/equipos.service';
import { Equipo } from '@/types/equipo-types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MisEquiposScreen() {
    const router = useRouter();
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [usuarioId, setUsuarioId] = useState<number | null>(null);

    // Cargar usuario ID al montar el componente
    useEffect(() => {
        cargarUsuarioId();
    }, []);

    // Cargar equipos cuando se tenga el usuario ID
    useEffect(() => {
        if (usuarioId !== null) {
            cargarEquipos();
        }
    }, [usuarioId]);

    const cargarUsuarioId = async () => {
        try {
            const id = await obtenerUsuarioId();
            if (id) {
                setUsuarioId(id);
            } else {
                Alert.alert('Error', 'No se pudo obtener el ID del usuario');
            }
        } catch (error) {
            console.error('Error cargando usuario ID:', error);
            Alert.alert('Error', 'Error al obtener la información del usuario');
        }
    };

    const cargarEquipos = async (pageNum: number = 0, append: boolean = false) => {
        if (!usuarioId) return;

        try {
            if (!append) setLoading(true);

            const response = await obtenerMisEquipos(usuarioId, {
                page: pageNum,
                size: 10,
                sort: ['id'],
            });

            if (append) {
                setEquipos(prev => [...prev, ...response.content]);
            } else {
                setEquipos(response.content);
            }

            setTotalPages(response.totalPages);
            setPage(pageNum);
            setHasMore(!response.last);
        } catch (error) {
            console.error('Error cargando equipos:', error);
            Alert.alert('Error', 'No se pudieron cargar los equipos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        cargarEquipos(0, false);
    }, [usuarioId]);

    const handleEquipoPress = (equipo: Equipo) => {
        router.push({
            pathname: '/screens/DetalleEquipoScreen',
            params: { equipo: JSON.stringify(equipo) }
        });
    };

    const cargarMasEquipos = () => {
        if (!loading && hasMore) {
            cargarEquipos(page + 1, true);
        }
    };

    const renderEquipo = ({ item }: { item: Equipo }) => (
        <TouchableOpacity style={styles.equipoCard} onPress={() => handleEquipoPress(item)}>
            <View style={styles.equipoHeader}>
                {/* Logo del equipo */}
                <View style={styles.logoContainer}>
                    {item.logo ? (
                        <Image source={{ uri: item.logo }} style={styles.logo} />
                    ) : (
                        <View style={[styles.logo, styles.logoPlaceholder]}>
                            <Ionicons name="shield" size={32} color="#666" />
                        </View>
                    )}
                </View>

                {/* Información principal */}
                <View style={styles.equipoInfo}>
                    <Text style={styles.equipoNombre}>{item.nombre}</Text>
                    <Text style={styles.equipoCiudad}>
                        <Ionicons name="location" size={14} color="#666" />
                        {' '}{item.ciudad}
                    </Text>

                    {/* Colores del equipo */}
                    <View style={styles.coloresContainer}>
                        <View style={[styles.colorDot, { backgroundColor: item.colorPrincipal }]} />
                        <View style={[styles.colorDot, { backgroundColor: item.colorSecundario }]} />
                    </View>
                </View>

                {/* Estado */}
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: item.estaActivo ? '#4CAF50' : '#999' }]}>
                        <Text style={styles.statusText}>{item.estaActivo ? 'Activo' : 'Inactivo'}</Text>
                    </View>
                </View>
            </View>

            {/* Descripción */}
            {item.descripcion && (
                <Text style={styles.descripcion} numberOfLines={2}>
                    {item.descripcion}
                </Text>
            )}

            {/* Información adicional */}
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="people" size={16} color="#666" />
                    <Text style={styles.infoText}>Máx: {item.maxMiembros}</Text>
                </View>

                {item.nivel && (
                    <View style={styles.infoItem}>
                        <Ionicons name="trophy" size={16} color="#666" />
                        <Text style={styles.infoText}>{item.nivel}</Text>
                    </View>
                )}

                <View style={styles.infoItem}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <Text style={styles.infoText}>
                        {item.calificacionPromedio > 0
                            ? item.calificacionPromedio.toFixed(1)
                            : 'Sin calificación'}
                    </Text>
                </View>

                {item.requiereAprobacion && (
                    <View style={styles.infoItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#2196F3" />
                        <Text style={styles.infoText}>Requiere aprobación</Text>
                    </View>
                )}
            </View>

            {/* Fecha de creación */}
            <Text style={styles.fechaCreacion}>
                Creado: {new Date(item.fechaCreacion).toLocaleDateString('es-ES')}
            </Text>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!hasMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#2196F3" />
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No tienes equipos registrados</Text>
            <Text style={styles.emptySubtext}>¡Crea tu primer equipo para empezar!</Text>
        </View>
    );

    if (loading && equipos.length === 0) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Cargando equipos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Mis Equipos</Text>
                <Text style={styles.subtitle}>
                    {equipos.length > 0
                        ? `${equipos.length} equipo${equipos.length !== 1 ? 's' : ''} encontrado${equipos.length !== 1 ? 's' : ''}`
                        : 'Sin equipos'}
                </Text>
            </View>

            {/* Lista de equipos */}
            <FlatList
                data={equipos}
                renderItem={renderEquipo}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={cargarMasEquipos}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
            />

            {/* Botón flotante para crear equipo */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/screens/CrearEquipoScreen')}
            >
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    listContainer: {
        padding: 16,
        flexGrow: 1,
    },
    equipoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    equipoHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    logoContainer: {
        marginRight: 12,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    logoPlaceholder: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    equipoInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    equipoNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    equipoCiudad: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    coloresContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    colorDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    statusContainer: {
        justifyContent: 'flex-start',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    descripcion: {
        fontSize: 14,
        color: '#555',
        marginBottom: 12,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#666',
    },
    fechaCreacion: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color:

            '#bbb',
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
