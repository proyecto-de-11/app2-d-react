import { crearEquipo, obtenerUsuarioId, registrarMiembro } from '@/services/equipos.service';
import { obtenerTiposDeporte, TipoDeporte } from '@/services/tipos-deporte.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CrearEquipoScreen() {
    const router = useRouter();

    // Form states
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [maxMiembros, setMaxMiembros] = useState('11');
    const [colorPrincipal, setColorPrincipal] = useState('#2196F3');
    const [colorSecundario, setColorSecundario] = useState('#FF9800');
    const [requiereAprobacion, setRequiereAprobacion] = useState(true);
    const [nivel, setNivel] = useState('');
    const [tiposDeporte, setTiposDeporte] = useState<TipoDeporte[]>([]);
    const [tipoDeporteId, setTipoDeporteId] = useState<number | null>(null);

    // UI states
    const [loading, setLoading] = useState(false);
    const [loadingDeportes, setLoadingDeportes] = useState(false);
    const [usuarioId, setUsuarioId] = useState<number | null>(null);

    useEffect(() => {
        cargarUsuarioId();
        cargarTiposDeporte();
    }, []);

    const cargarUsuarioId = async () => {
        const id = await obtenerUsuarioId();
        if (id) {
            setUsuarioId(id);
        } else {
            Alert.alert('Error', 'No se pudo obtener el ID del usuario');
            router.back();
        }
    };

    const cargarTiposDeporte = async () => {
        setLoadingDeportes(true);
        try {
            const deportes = await obtenerTiposDeporte();
            setTiposDeporte(deportes);
        } catch (error) {
            console.error('Error cargando tipos de deporte:', error);
            Alert.alert('Error', 'No se pudieron cargar los tipos de deporte');
        } finally {
            setLoadingDeportes(false);
        }
    };

    const validarFormulario = (): boolean => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre del equipo es obligatorio');
            return false;
        }
        if (!ciudad.trim()) {
            Alert.alert('Error', 'La ciudad es obligatoria');
            return false;
        }
        if (!descripcion.trim()) {
            Alert.alert('Error', 'La descripción es obligatoria');
            return false;
        }
        if (!tipoDeporteId) {
            Alert.alert('Error', 'Debes seleccionar un tipo de deporte');
            return false;
        }

        const maxMiembrosNum = parseInt(maxMiembros);
        if (isNaN(maxMiembrosNum) || maxMiembrosNum < 5) {
            Alert.alert('Error', 'El número de miembros debe ser al menos 5');
            return false;
        }

        return true;
    };

    const handleCrearEquipo = async () => {
        console.log('🔵 handleCrearEquipo llamado');
        console.log('📋 usuarioId:', usuarioId);

        if (!validarFormulario() || !usuarioId) {
            console.log('❌ Validación fallida o usuarioId no existe');
            return;
        }

        console.log('✅ Validación exitosa, iniciando creación...');
        setLoading(true);
        try {
            // Paso 1: Crear el equipo
            const nuevoEquipo = await crearEquipo({
                nombre: nombre.trim(),
                creadoPor: usuarioId,
                tipoDeporteId: tipoDeporteId!,
                descripcion: descripcion.trim(),
                colorPrincipal,
                colorSecundario,
                ciudad: ciudad.trim(),
                nivel: nivel || undefined,
                maxMiembros: parseInt(maxMiembros),
                requiereAprobacion,
                estaActivo: true,
            });

            console.log('✅ Equipo creado:', nuevoEquipo.id);

            // Paso 2: Registrar al creador como capitán del equipo
            try {
                await registrarMiembro({
                    equipoId: nuevoEquipo.id,
                    usuarioId: usuarioId,
                    rol: 'capitan',
                    numeroCamiseta: 1,
                    posicion: 'delantero',
                    estado: 'activo',
                });
                console.log('✅ Creador registrado como capitán');
            } catch (errorMiembro) {
                console.error('⚠️ Error al registrar miembro, pero equipo fue creado:', errorMiembro);
            }

            Alert.alert(
                '¡Éxito!',
                `El equipo "${nuevoEquipo.nombre}" ha sido creado exitosamente`,
                [
                    {
                        text: 'Ver Equipo',
                        onPress: () => router.push({
                            pathname: '/screens/DetalleEquipoScreen',
                            params: { equipoId: nuevoEquipo.id.toString() }
                        }),
                    },
                ]
            );
        } catch (error) {
            console.error('Error creando equipo:', error);
            Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'No se pudo crear el equipo'
            );
        } finally {
            setLoading(false);
        }
    };

    const ColorPickerButton = ({ color, onPress, label }: { color: string; onPress: () => void; label: string }) => (
        <TouchableOpacity style={styles.colorPickerButton} onPress={onPress}>
            <View style={[styles.colorPreview, { backgroundColor: color }]} />
            <View style={styles.colorInfo}>
                <Text style={styles.colorLabel}>{label}</Text>
                <Text style={styles.colorValue}>{color}</Text>
            </View>
            <Ionicons name="color-palette-outline" size={24} color="#666" />
        </TouchableOpacity>
    );

    const predefinedColors = [
        '#2196F3', '#FF9800', '#4CAF50', '#F44336', '#9C27B0',
        '#FFEB3B', '#00BCD4', '#FF5722', '#3F51B5', '#E91E63',
    ];

    const ColorSelector = ({
        visible,
        currentColor,
        onSelect,
        onClose,
        title
    }: {
        visible: boolean;
        currentColor: string;
        onSelect: (color: string) => void;
        onClose: () => void;
        title: string;
    }) => {
        if (!visible) return null;

        return (
            <View style={styles.colorSelectorOverlay}>
                <View style={styles.colorSelectorModal}>
                    <View style={styles.colorSelectorHeader}>
                        <Text style={styles.colorSelectorTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.colorsGrid}>
                        {predefinedColors.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: color },
                                    currentColor === color && styles.selectedColorOption,
                                ]}
                                onPress={() => {
                                    onSelect(color);
                                    onClose();
                                }}
                            >
                                {currentColor === color && (
                                    <Ionicons name="checkmark" size={24} color="#FFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
    const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crear Equipo</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información Básica</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre del Equipo *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Los Tigres"
                            value={nombre}
                            onChangeText={setNombre}
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tipo de Deporte *</Text>
                        {loadingDeportes ? (
                            <ActivityIndicator size="small" color="#2196F3" />
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deportesContainer}>
                                {tiposDeporte.map((deporte) => (
                                    <TouchableOpacity
                                        key={deporte.id}
                                        style={[
                                            styles.deporteCard,
                                            tipoDeporteId === deporte.id && styles.deporteCardSelected
                                        ]}
                                        onPress={() => setTipoDeporteId(deporte.id)}
                                    >
                                        <View style={styles.deporteIconContainer}>
                                            {deporte.icono && deporte.icono.startsWith('http') ? (
                                                <Image source={{ uri: deporte.icono }} style={styles.deporteIcon} />
                                            ) : (
                                                <Ionicons name="trophy-outline" size={24} color={tipoDeporteId === deporte.id ? "#FFF" : "#666"} />
                                            )}
                                        </View>
                                        <Text style={[
                                            styles.deporteName,
                                            tipoDeporteId === deporte.id && styles.deporteNameSelected
                                        ]}>
                                            {deporte.nombre}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ciudad *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: San Salvador"
                            value={ciudad}
                            onChangeText={setCiudad}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descripción *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe tu equipo..."
                            value={descripcion}
                            onChangeText={setDescripcion}
                            multiline
                            numberOfLines={4}
                            maxLength={200}
                        />
                        <Text style={styles.charCount}>{descripcion.length}/200</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configuración</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Máximo de Miembros *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="11"
                            value={maxMiembros}
                            onChangeText={setMaxMiembros}
                            keyboardType="number-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nivel del Equipo</Text>
                        <View style={styles.nivelContainer}>
                            {['principiante', 'intermedio', 'avanzado', 'profesional'].map((nivelOption) => (
                                <TouchableOpacity
                                    key={nivelOption}
                                    style={[
                                        styles.nivelButton,
                                        nivel === nivelOption && styles.nivelButtonSelected,
                                    ]}
                                    onPress={() => setNivel(nivelOption)}
                                >
                                    <Text
                                        style={[
                                            styles.nivelButtonText,
                                            nivel === nivelOption && styles.nivelButtonTextSelected,
                                        ]}
                                    >
                                        {nivelOption.charAt(0).toUpperCase() + nivelOption.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.switchGroup}>
                        <View style={styles.switchInfo}>
                            <Ionicons name="shield-checkmark" size={24} color="#2196F3" />
                            <View style={styles.switchTextContainer}>
                                <Text style={styles.switchLabel}>Requiere Aprobación</Text>
                                <Text style={styles.switchDescription}>
                                    Los nuevos miembros deben ser aprobados
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={requiereAprobacion}
                            onValueChange={setRequiereAprobacion}
                            trackColor={{ false: '#ccc', true: '#2196F3' }}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Colores del Equipo</Text>

                    <ColorPickerButton
                        color={colorPrincipal}
                        onPress={() => setShowPrimaryPicker(true)}
                        label="Color Principal"
                    />

                    <ColorPickerButton
                        color={colorSecundario}
                        onPress={() => setShowSecondaryPicker(true)}
                        label="Color Secundario"
                    />

                    <View style={styles.previewContainer}>
                        <Text style={styles.previewLabel}>Vista Previa:</Text>
                        <View style={styles.shieldPreview}>
                            <LinearGradient
                                colors={[colorPrincipal, colorSecundario]}
                                style={styles.shieldGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="shield" size={48} color="#FFF" />
                            </LinearGradient>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.createButton, loading && styles.createButtonDisabled]}
                    onPress={handleCrearEquipo}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={loading ? ['#ccc', '#999'] : ['#2196F3', '#1976D2']}
                        style={styles.createButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="add-circle" size={24} color="#FFF" />
                                <Text style={styles.createButtonText}>Crear Equipo</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            <ColorSelector
                visible={showPrimaryPicker}
                currentColor={colorPrincipal}
                onSelect={setColorPrincipal}
                onClose={() => setShowPrimaryPicker(false)}
                title="Color Principal"
            />
            <ColorSelector
                visible={showSecondaryPicker}
                currentColor={colorSecundario}
                onSelect={setColorSecundario}
                onClose={() => setShowSecondaryPicker(false)}
                title="Color Secundario"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    switchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    switchTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    switchDescription: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    colorPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    colorPreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    colorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    colorLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    colorValue: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    previewContainer: {
        marginTop: 8,
        alignItems: 'center',
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 12,
    },
    shieldPreview: {
        width: 80,
        height: 80,
    },
    shieldGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    createButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 10,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    createButtonDisabled: {
        shadowOpacity: 0,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    colorSelectorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    colorSelectorModal: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        width: '85%',
        maxWidth: 400,
    },
    colorSelectorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    colorSelectorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    colorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    colorOption: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    selectedColorOption: {
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    nivelContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    nivelButton: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: '#F9F9F9',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    nivelButtonSelected: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    nivelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    nivelButtonTextSelected: {
        color: '#2196F3',
    },
    // Estilos para deportes
    deportesContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    deporteCard: {
        alignItems: 'center',
        marginRight: 12,
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        width: 100,
    },
    deporteCardSelected: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    deporteIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    deporteIcon: {
        width: '100%',
        height: '100%',
    },
    deporteName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    deporteNameSelected: {
        color: '#2196F3',
    },
});
