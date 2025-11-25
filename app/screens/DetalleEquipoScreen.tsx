import { Equipo } from '@/types/equipo-types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetalleEquipoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parsear el equipo desde los parámetros
    const equipo: Equipo = params.equipo ? JSON.parse(params.equipo as string) : null;

    if (!equipo) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#999" />
                <Text style={styles.errorText}>No se encontró información del equipo</Text>
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
                                <Text style={styles.infoValue}>ID {equipo.tipoDeporteId}</Text>
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
                                <Text style={styles.infoValue}>Usuario #{equipo.creadoPor}</Text>
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

                    {/* Botones de acción */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.actionButtonGradient}>
                                <Ionicons name="pencil" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Editar Equipo</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                            <View style={styles.secondaryButtonContent}>
                                <Ionicons name="people-outline" size={20} color="#7033FF" />
                                <Text style={styles.secondaryButtonText}>Ver Miembros</Text>
                            </View>
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
});
