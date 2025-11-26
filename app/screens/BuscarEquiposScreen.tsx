import { enviarSolicitudUnirse } from '@/services/invitaciones.service';
import type { Equipo, EquiposPaginados } from '@/types/equipo-types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const EQUIPOS_BASE_URL = 'https://apiequiposyjugadores.onrender.com';

const BuscarEquiposScreen = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // Función para buscar equipos
    const buscarEquipos = async (page: number = 0, busqueda: string = searchQuery, isRefresh: boolean = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const token = await AsyncStorage.getItem('userToken');

            // Construir query params
            const queryParams = new URLSearchParams({
                page: page.toString(),
                size: pageSize.toString(),
                sort: 'id',
            });

            // Agregar búsqueda si existe
            if (busqueda.trim()) {
                queryParams.append('busqueda', busqueda.trim());
            }

            const url = `${EQUIPOS_BASE_URL}/api/equipos?${queryParams.toString()}`;
            console.log('🔍 Buscando equipos:', url);

            const response = await axios.get<EquiposPaginados>(url, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                    accept: '*/*',
                },
            });

            setEquipos(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
            setCurrentPage(response.data.number);

            console.log('✅ Equipos encontrados:', response.data.totalElements);
        } catch (error) {
            console.error('❌ Error al buscar equipos:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error details:', error.response?.data);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Cargar equipos al montar el componente
    useEffect(() => {
        buscarEquipos();
    }, []);

    // Función para manejar la búsqueda
    const handleSearch = () => {
        setCurrentPage(0);
        buscarEquipos(0, searchQuery);
    };

    // Función para refrescar
    const onRefresh = () => {
        buscarEquipos(currentPage, searchQuery, true);
    };

    // Función para cambiar de página
    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            buscarEquipos(newPage, searchQuery);
        }
    };

    // Función para navegar al detalle
    const handleEquipoPress = (equipoId: number) => {
        router.push(`/screens/DetalleEquipoScreen?equipoId=${equipoId}`);
    };

    // Función para solicitar unirse a un equipo
    const handleSolicitarUnirse = async (equipoId: number, equipoNombre: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');

            if (!userId) {
                Alert.alert('Error', 'No se pudo obtener tu información de usuario');
                return;
            }

            const usuarioId = parseInt(userId);

            Alert.alert(
                'Solicitar unirse',
                `¿Deseas enviar una solicitud para unirte a "${equipoNombre}"?`,
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    },
                    {
                        text: 'Enviar solicitud',
                        onPress: async () => {
                            try {
                                await enviarSolicitudUnirse({
                                    equipoId: equipoId,
                                    usuarioInvitadoId: usuarioId,
                                    usuarioRemitenteId: usuarioId,
                                    mensaje: 'Quiero unirme al equipo'
                                });

                                Alert.alert(
                                    'Solicitud enviada',
                                    'Tu solicitud ha sido enviada exitosamente. El equipo revisará tu solicitud.',
                                    [{ text: 'OK' }]
                                );
                            } catch (error) {
                                Alert.alert(
                                    'Error',
                                    error instanceof Error ? error.message : 'No se pudo enviar la solicitud'
                                );
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error al solicitar unirse:', error);
            Alert.alert('Error', 'Ocurrió un error al procesar tu solicitud');
        }
    };

    // Renderizar tarjeta de equipo
    const renderEquipoCard = (equipo: Equipo) => (
        <View
            key={equipo.id}
            style={styles.equipoCard}
        >
            <TouchableOpacity
                onPress={() => handleEquipoPress(equipo.id)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: equipo.logo || 'https://via.placeholder.com/80' }}
                        style={styles.equipoLogo}
                    />
                    <View style={styles.equipoInfo}>
                        <Text style={styles.equipoNombre} numberOfLines={1}>
                            {equipo.nombre}
                        </Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={14} color="#8A8A93" />
                            <Text style={styles.equipoCiudad} numberOfLines={1}>
                                {equipo.ciudad}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="account-group" size={14} color="#8A8A93" />
                            <Text style={styles.equipoMiembros}>
                                Máx: {equipo.maxMiembros} miembros
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cardActions}>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#FFC700" />
                            <Text style={styles.ratingText}>
                                {equipo.calificacionPromedio > 0
                                    ? equipo.calificacionPromedio.toFixed(1)
                                    : 'N/A'}
                            </Text>
                        </View>
                        {equipo.requiereAprobacion && (
                            <View style={styles.badgeContainer}>
                                <Ionicons name="shield-checkmark" size={14} color="#7033FF" />
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.colorIndicators}>
                        <View style={[styles.colorDot, { backgroundColor: equipo.colorPrincipal }]} />
                        <View style={[styles.colorDot, { backgroundColor: equipo.colorSecundario }]} />
                    </View>
                    <Text style={styles.equipoDescripcion} numberOfLines={2}>
                        {equipo.descripcion}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Botón de solicitar unirse */}
            <TouchableOpacity
                style={styles.joinButton}
                onPress={(e) => {
                    e.stopPropagation();
                    handleSolicitarUnirse(equipo.id, equipo.nombre);
                }}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#7033FF', '#B34CFF']}
                    style={styles.joinButtonGradient}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <Ionicons name="person-add" size={16} color="#fff" />
                    <Text style={styles.joinButtonText}>Solicitar unirse</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Buscar Equipos</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={22} color="#8A8A93" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar equipos..."
                        placeholderTextColor="#8A8A93"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => {
                            setSearchQuery('');
                            buscarEquipos(0, '');
                        }}>
                            <Ionicons name="close-circle" size={22} color="#8A8A93" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <LinearGradient
                        colors={['#7033FF', '#B34CFF']}
                        style={styles.searchButtonGradient}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                    >
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Results Info */}
            <View style={styles.resultsInfo}>
                <Text style={styles.resultsText}>
                    {loading ? 'Buscando...' : `${totalElements} equipos encontrados`}
                </Text>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7033FF']} />
                }
            >
                {loading && currentPage === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#7033FF" />
                        <Text style={styles.loadingText}>Cargando equipos...</Text>
                    </View>
                ) : equipos.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="shield-search" size={80} color="#D0D0D0" />
                        <Text style={styles.emptyTitle}>No se encontraron equipos</Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Aún no hay equipos disponibles'}
                        </Text>
                    </View>
                ) : (
                    <>
                        {equipos.map(renderEquipoCard)}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <View style={styles.paginationContainer}>
                                <TouchableOpacity
                                    style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
                                    onPress={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0 || loading}
                                >
                                    <Ionicons
                                        name="chevron-back"
                                        size={20}
                                        color={currentPage === 0 ? '#D0D0D0' : '#7033FF'}
                                    />
                                </TouchableOpacity>

                                <View style={styles.paginationInfo}>
                                    <Text style={styles.paginationText}>
                                        Página {currentPage + 1} de {totalPages}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.paginationButton,
                                        currentPage === totalPages - 1 && styles.paginationButtonDisabled,
                                    ]}
                                    onPress={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1 || loading}
                                >
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={currentPage === totalPages - 1 ? '#D0D0D0' : '#7033FF'}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F7F8FC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerPlaceholder: {
        width: 40,
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchContainer: {
        flex: 1,
        backgroundColor: '#F7F8FC',
        borderRadius: 14,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
        marginLeft: 10,
        fontWeight: '500',
    },
    searchButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    searchButtonGradient: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    resultsInfo: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    resultsText: {
        fontSize: 14,
        color: '#8A8A93',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#8A8A93',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8A8A93',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    equipoCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    equipoLogo: {
        width: 70,
        height: 70,
        borderRadius: 14,
        backgroundColor: '#F7F8FC',
    },
    equipoInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    equipoNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    equipoCiudad: {
        fontSize: 13,
        color: '#8A8A93',
        marginLeft: 4,
        flex: 1,
    },
    equipoMiembros: {
        fontSize: 13,
        color: '#8A8A93',
        marginLeft: 4,
    },
    cardActions: {
        alignItems: 'flex-end',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    badgeContainer: {
        backgroundColor: '#F7F3FF',
        padding: 6,
        borderRadius: 8,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    colorIndicators: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 6,
    },
    colorDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    equipoDescripcion: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    joinButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 12,
        shadowColor: '#7033FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    joinButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 15,
    },
    paginationButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    paginationButtonDisabled: {
        backgroundColor: '#F7F8FC',
    },
    paginationInfo: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    paginationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
});

export default BuscarEquiposScreen;
