import { obtenerEquipoPorId } from '@/services/equipos.service';
import { obtenerInvitacionesEquipo } from '@/services/invitaciones.service';
import { obtenerMiembrosEquipo } from '@/services/miembros.service';
import { obtenerTipoDeportePorId } from '@/services/tipos-deporte.service';
import { obtenerUsuarioPorId, UsuarioPerfil } from '@/services/usuario.service';
import { Equipo } from '@/types/equipo-types';
import { Miembro } from '@/types/miembro-types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetalleEquipoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [equipo, setEquipo] = useState<Equipo | null>(null);
    const [miembros, setMiembros] = useState<Miembro[]>([]);
    const [usuariosInfo, setUsuariosInfo] = useState<Record<number, UsuarioPerfil>>({});
    const [loading, setLoading] = useState(true);
    const [loadingMiembros, setLoadingMiembros] = useState(false);
    const [loadingInvitaciones, setLoadingInvitaciones] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalMiembros, setTotalMiembros] = useState(0);
    const [totalInvitaciones, setTotalInvitaciones] = useState(0);
    const [usuarioActualId, setUsuarioActualId] = useState<number | null>(null);
    const [esMiembro, setEsMiembro] = useState(false);
    const [nombreDeporte, setNombreDeporte] = useState<string>('');

    // Obtener equipoId de los parámetros
    const equipoId = params.equipoId ? parseInt(params.equipoId as string) : null;

    useEffect(() => {
        cargarUsuarioId();
    }, []);

    useEffect(() => {
        if (equipoId && usuarioActualId) {
            cargarEquipo();
            cargarMiembros();
        } else if (equipoId && !usuarioActualId) {
            setError('No se proporcionó ID del equipo');
            setLoading(false);
        }
    }, [equipoId, usuarioActualId]);

    useEffect(() => {
        // Verificar si el usuario es miembro cuando se cargan los miembros
        if (miembros.length > 0 && usuarioActualId) {
            const esMiembroDelEquipo = miembros.some(m => m.usuarioId === usuarioActualId);
            setEsMiembro(esMiembroDelEquipo);

            // Si es miembro, cargar invitaciones (solo conteo)
            if (esMiembroDelEquipo && equipoId) {
                cargarInvitaciones();
            }
        }
    }, [miembros, usuarioActualId]);

    // Efecto para cargar el perfil del creador del equipo
    useEffect(() => {
        if (equipo && equipo.creadoPor && !usuariosInfo[equipo.creadoPor]) {
            cargarPerfilUsuario(equipo.creadoPor);
        }
    }, [equipo]);

    // Efecto para cargar el nombre del tipo de deporte
    useEffect(() => {
        const cargarNombreDeporte = async () => {
            if (equipo && equipo.tipoDeporteId) {
                try {
                    const tipoDeporte = await obtenerTipoDeportePorId(equipo.tipoDeporteId);
                    setNombreDeporte(tipoDeporte.nombre);
                } catch (err) {
                    console.error('Error cargando tipo de deporte:', err);
                    setNombreDeporte('Deporte desconocido');
                }
            }
        };
        cargarNombreDeporte();
    }, [equipo]);

    const cargarUsuarioId = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                setUsuarioActualId(parseInt(userId));
            }
        } catch (err) {
            console.error('Error cargando usuario ID:', err);
        }
    };

    const cargarEquipo = async () => {
        if (!equipoId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await obtenerEquipoPorId(equipoId);
            setEquipo(data);
        } catch (err) {
            console.error('Error cargando equipo:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar el equipo');
        } finally {
            setLoading(false);
        }
    };

    const cargarPerfilUsuario = async (userId: number) => {
        try {
            console.log('Fetching info for creator:', userId);
            const usuario = await obtenerUsuarioPorId(userId);
            setUsuariosInfo(prev => ({ ...prev, [userId]: usuario }));
        } catch (err) {
            console.error(`Error fetching user ${userId}`, err);
        }
    };

    const cargarMiembros = async () => {
        if (!equipoId) return;

        try {
            setLoadingMiembros(true);
            const response = await obtenerMiembrosEquipo(equipoId, {
                page: 0,
                size: 50,
                sort: ['id']
            });
            setMiembros(response.content);
            setTotalMiembros(response.totalElements);

            // Obtener información de usuarios
            const usuariosIds = [...new Set(response.content.map(m => m.usuarioId))];

            // Filtrar IDs que ya tenemos para no volver a pedirlos
            const idsAFetch = usuariosIds.filter(id => !usuariosInfo[id]);

            if (idsAFetch.length > 0) {
                console.log('Fetching info for users:', idsAFetch);
                const promesas = idsAFetch.map(id =>
                    obtenerUsuarioPorId(id)
                        .then((usuario: UsuarioPerfil) => ({ id, usuario }))
                        .catch((err: any) => {
                            console.error(`Error fetching user ${id}`, err);
                            return { id, usuario: null };
                        })
                );

                const resultados = await Promise.all(promesas);

                const nuevosUsuariosInfo = { ...usuariosInfo };
                resultados.forEach(({ id, usuario }: { id: number, usuario: UsuarioPerfil | null }) => {
                    if (usuario) {
                        nuevosUsuariosInfo[id] = usuario;
                    }
                });

                setUsuariosInfo(prev => ({ ...prev, ...nuevosUsuariosInfo }));
            }

        } catch (err) {
            console.error('Error cargando miembros:', err);
        } finally {
            setLoadingMiembros(false);
        }
    };

    const cargarInvitaciones = async () => {
        if (!equipoId) return;

        try {
            setLoadingInvitaciones(true);
            const response = await obtenerInvitacionesEquipo(equipoId, {
                page: 0,
                size: 1,
                sort: ['fechaCreacion']
            });
            setTotalInvitaciones(response.totalElements);
        } catch (err) {
            console.error('Error cargando invitaciones:', err);
            // Si hay un error 403, es porque no es miembro
            if (err instanceof Error && err.message.includes('permisos')) {
                setEsMiembro(false);
            }
        } finally {
            setLoadingInvitaciones(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7033FF" />
                <Text style={styles.loadingText}>Cargando equipo...</Text>
            </SafeAreaView>
        );
    }

    if (error || !equipo) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#999" />
                <Text style={styles.errorText}>
                    {error || 'No se encontró información del equipo'}
                </Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header con gradiente */}
                <LinearGradient
                    colors={[equipo.colorPrincipal || '#5D23E4', equipo.colorSecundario || '#A044FF']}
                    style={styles.header}
                >
                    {/* Botón de volver */}
                    <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
                        <View style={styles.navButtonCircle}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </View>
                    </TouchableOpacity>

                    {/* Logo del equipo */}
                    <View style={styles.logoWrapper}>
                        {equipo.logo ? (
                            <Image source={{ uri: equipo.logo }} style={styles.logo} />
                        ) : (
                            <View style={[styles.logo, styles.logoPlaceholder]}>
                                <Ionicons name="shield" size={60} color="#fff" />
                            </View>
                        )}
                    </View>

                    {/* Nombre del equipo */}
                    <Text style={styles.nombreEquipo}>{equipo.nombre}</Text>

                    {/* Ciudad */}
                    <View style={styles.ciudadContainer}>
                        <Ionicons name="location" size={16} color="#fff" />
                        <Text style={styles.ciudad}>{equipo.ciudad}</Text>
                    </View>

                    {/* Badge de estado */}
                    <View style={[styles.estadoBadge, { backgroundColor: equipo.estaActivo ? 'rgba(76, 175, 80, 0.9)' : 'rgba(153, 153, 153, 0.9)' }]}>
                        <Text style={styles.estadoText}>
                            {equipo.estaActivo ? '✓ Activo' : '✗ Inactivo'}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Contenido principal */}
                <View style={styles.contentArea}>
                    {/* Tarjeta de estadísticas */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="people" size={24} color="#7033FF" />
                            </View>
                            <Text style={styles.statValue}>{equipo.maxMiembros}</Text>
                            <Text style={styles.statLabel}>Máx. Miembros</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="star" size={24} color="#FFB800" />
                            </View>
                            <Text style={styles.statValue}>
                                {equipo.calificacionPromedio > 0 ? equipo.calificacionPromedio.toFixed(1) : 'N/A'}
                            </Text>
                            <Text style={styles.statLabel}>Calificación</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>
                                <Ionicons name="trophy" size={24} color="#FF6B35" />
                            </View>
                            <Text style={styles.statValue}>{equipo.totalCalificaciones}</Text>
                            <Text style={styles.statLabel}>Valoraciones</Text>
                        </View>
                    </View>

                    {/* Descripción */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document-text" size={20} color="#7033FF" />
                            <Text style={styles.sectionTitle}>Descripción</Text>
                        </View>
                        <Text style={styles.descripcion}>
                            {equipo.descripcion || 'Sin descripción disponible'}
                        </Text>
                    </View>

                    {/* Información del equipo */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle" size={20} color="#7033FF" />
                            <Text style={styles.sectionTitle}>Información</Text>
                        </View>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>ID del Equipo</Text>
                                <Text style={styles.infoValue}>#{equipo.id}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Tipo Deporte</Text>
                                <Text style={styles.infoValue}>{nombreDeporte || 'Cargando...'}</Text>
                            </View>

                            {equipo.nivel && (
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>Nivel</Text>
                                    <Text style={styles.infoValue}>{equipo.nivel}</Text>
                                </View>
                            )}

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Requiere Aprobación</Text>
                                <View style={styles.booleanValue}>
                                    <Ionicons
                                        name={equipo.requiereAprobacion ? "checkmark-circle" : "close-circle"}
                                        size={18}
                                        color={equipo.requiereAprobacion ? "#4CAF50" : "#999"}
                                    />
                                    <Text style={styles.infoValue}>
                                        {equipo.requiereAprobacion ? 'Sí' : 'No'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Creado Por</Text>
                                <Text style={styles.infoValue}>
                                    {usuariosInfo[equipo.creadoPor]?.nombreCompleto ||
                                        usuariosInfo[equipo.creadoPor]?.usuario?.email ||
                                        `Usuario #${equipo.creadoPor}`}
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha de Creación</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(equipo.fechaCreacion).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Última Actualización</Text>
                                <Text style={styles.infoValue}>
                                    {new Date(equipo.fechaActualizacion).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Colores del equipo */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="color-palette" size={20} color="#7033FF" />
                            <Text style={styles.sectionTitle}>Colores</Text>
                        </View>

                        <View style={styles.coloresRow}>
                            <View style={styles.colorCard}>
                                <View style={[styles.colorPreview, { backgroundColor: equipo.colorPrincipal }]} />
                                <Text style={styles.colorLabel}>Principal</Text>
                                <Text style={styles.colorCode}>{equipo.colorPrincipal}</Text>
                            </View>

                            <View style={styles.colorCard}>
                                <View style={[styles.colorPreview, { backgroundColor: equipo.colorSecundario }]} />
                                <Text style={styles.colorLabel}>Secundario</Text>
                                <Text style={styles.colorCode}>{equipo.colorSecundario}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Miembros del equipo */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="people" size={20} color="#7033FF" />
                            <Text style={styles.sectionTitle}>
                                Miembros ({totalMiembros})
                            </Text>
                        </View>

                        {loadingMiembros ? (
                            <View style={styles.loadingMiembrosContainer}>
                                <ActivityIndicator size="small" color="#7033FF" />
                                <Text style={styles.loadingMiembrosText}>Cargando miembros...</Text>
                            </View>
                        ) : miembros.length > 0 ? (
                            <View style={styles.miembrosContainer}>
                                {miembros.map((miembro, index) => (
                                    <View key={miembro.id} style={styles.miembroItem}>
                                        <View style={styles.miembroInfo}>
                                            <View style={styles.miembroIconContainer}>
                                                <Ionicons name="person-circle" size={40} color="#7033FF" />
                                            </View>
                                            <View style={styles.miembroDetails}>
                                                <View style={styles.miembroHeader}>
                                                    <Text style={styles.miembroUsuarioId}>
                                                        {usuariosInfo[miembro.usuarioId]?.nombreCompleto ||
                                                            usuariosInfo[miembro.usuarioId]?.usuario?.email ||
                                                            'Usuario Desconocido'}
                                                    </Text>
                                                    <View style={[
                                                        styles.rolBadge,
                                                        miembro.rol.toLowerCase() === 'capitan' && styles.rolCapitan,
                                                        miembro.rol.toLowerCase() === 'jugador' && styles.rolJugador
                                                    ]}>
                                                        <Text style={styles.rolText}>
                                                            {miembro.rol}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View style={styles.miembroMeta}>
                                                    <Text style={styles.miembroMetaText}>
                                                        #{miembro.numeroCamiseta} • {miembro.posicion}
                                                    </Text>
                                                    <View style={[
                                                        styles.estadoBadgeSmall,
                                                        miembro.estado.toLowerCase() === 'activo' && styles.estadoActivo,
                                                        miembro.estado.toLowerCase() === 'inactivo' && styles.estadoInactivo
                                                    ]}>
                                                        <Text style={styles.estadoBadgeText}>{miembro.estado}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyMiembros}>
                                <Ionicons name="people-outline" size={48} color="#D0D0D0" />
                                <Text style={styles.emptyMiembrosText}>No hay miembros en este equipo</Text>
                            </View>
                        )}
                    </View>

                    {/* Invitaciones (solo visible para miembros) */}
                    {esMiembro && (
                        <View style={styles.section}>
                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() => router.push({
                                    pathname: '/screens/SolicitudesEquipoScreen',
                                    params: { equipoId }
                                })}
                            >
                                <View style={styles.menuButtonContent}>
                                    <View style={styles.menuIconContainer}>
                                        <Ionicons name="mail" size={24} color="#7033FF" />
                                    </View>
                                    <View style={styles.menuTextContainer}>
                                        <Text style={styles.menuTitle}>Solicitudes de Unión</Text>
                                        <Text style={styles.menuSubtitle}>
                                            {loadingInvitaciones ? 'Cargando...' : `${totalInvitaciones} solicitudes pendientes`}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} color="#ccc" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Botones de acción */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.actionButtonGradient}>
                                <Ionicons name="pencil" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Editar Equipo</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F2FB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F2FB',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F2FB',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#7033FF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    navButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
    },
    navButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    logoWrapper: {
        marginTop: 20,
        marginBottom: 16,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.9)',
    },
    logoPlaceholder: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nombreEquipo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    ciudadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ciudad: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginLeft: 4,
    },
    estadoBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    estadoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    contentArea: {
        paddingHorizontal: 20,
        marginTop: -20,
    },
    statsCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIconContainer: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    statLabel: {
        fontSize: 12,
        color: '#8A8A93',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    descripcion: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    infoGrid: {
        gap: 16,
    },
    infoItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 12,
    },
    infoLabel: {
        fontSize: 13,
        color: '#8A8A93',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '600',
    },
    booleanValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    coloresRow: {
        flexDirection: 'row',
        gap: 12,
    },
    colorCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
    },
    colorPreview: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    colorLabel: {
        fontSize: 13,
        color: '#8A8A93',
        marginBottom: 4,
    },
    colorCode: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '600',
    },
    actionsContainer: {
        gap: 12,
        marginTop: 8,
        marginBottom: 20,
    },
    actionButton: {
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#7033FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    actionButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    secondaryButtonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#7033FF',
        gap: 8,
    },
    secondaryButtonText: {
        color: '#7033FF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Estilos para miembros
    loadingMiembrosContainer: {
        paddingVertical: 30,
        alignItems: 'center',
    },
    loadingMiembrosText: {
        marginTop: 10,
        fontSize: 14,
        color: '#8A8A93',
    },
    miembrosContainer: {
        gap: 12,
    },
    miembroItem: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    miembroInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    miembroIconContainer: {
        marginRight: 12,
    },
    miembroDetails: {
        flex: 1,
    },
    miembroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    miembroUsuarioId: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    rolBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
    },
    rolCapitan: {
        backgroundColor: '#FFE5B4',
    },
    rolJugador: {
        backgroundColor: '#E3F2FD',
    },
    rolText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1A1A1A',
        textTransform: 'capitalize',
    },
    miembroMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    miembroMetaText: {
        fontSize: 13,
        color: '#666',
    },
    estadoBadgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    estadoActivo: {
        backgroundColor: '#E8F5E9',
    },
    estadoInactivo: {
        backgroundColor: '#FFEBEE',
    },
    estadoBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1A1A1A',
        textTransform: 'capitalize',
    },
    emptyMiembros: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyMiembrosText: {
        fontSize: 14,
        color: '#8A8A93',
        marginTop: 10,
    },
    // Estilos para botón de menú
    menuButton: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#8A8A93',
    },
});
