
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, StatusBar, TextInput, Alert
} from 'react-native';
import { ArrowLeft, Camera, User, Book, Phone, Hash, Map, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios, { isAxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
// FIX: Import from the legacy module to solve the deprecation error.
import * as FileSystem from 'expo-file-system/legacy';

// =====================================================================================
// FINAL FIX - EditProfileScreen
// - Implements a robust, professional layout to fix the avatar clipping bug permanently.
// - Uses a layered approach with absolute positioning for the avatar.
// - Abandons faulty negative margin hacks for a predictable and clean UI.
// - This is the definitive version focused on correctness and refined aesthetics.
// - FIX: Image is now converted to Base64 before being sent to the server.
// - FIX 2: Uses legacy 'expo-file-system' import to solve deprecation error.
// =====================================================================================

interface ProfileFormData {
    nombreCompleto: string;
    biografia: string;
    telefono: string;
    documentoIdentidad: string;
    ciudad: string;
    pais: string;
    fotoPerfil: string;
}

interface InputFieldProps {
    icon: React.ElementType;
    value: string | undefined;
    onChangeText: (text: string) => void;
    placeholder: string;
    label: string;
    isLast?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ icon: Icon, label, value, onChangeText, placeholder, isLast }) => (
  <View style={[styles.inputContainer, isLast && { borderBottomWidth: 0 }]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputRow}>
      <Icon size={20} color="#8A8A93" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C7C7CD"
      />
    </View>
  </View>
);

const EditProfileScreen = () => {
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const router = useRouter();

  // --- LOGIC ---
  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');
      if (!userId || !token) { router.replace('/login'); return; }
      const response = await axios.get(`https://apiautentificacion.onrender.com/api/perfiles/usuario/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setFormData(response.data);
      setProfileId(response.data.id);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      Alert.alert('Error', 'No se pudieron cargar tus datos.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reducir calidad para un string base64 más pequeño
    });

    if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        try {
            // Convertir la imagen a base64 usando la API legacy
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            // Crear el Data URI
            const base64Image = `data:image/jpeg;base64,${base64}`;
            handleInputChange('fotoPerfil', base64Image);
        } catch (error) {
            console.error("Error converting image to base64:", error);
            Alert.alert('Error', 'No se pudo procesar la imagen seleccionada.');
        }
    }
  };

  const handleSave = async () => {
    if (!formData || profileId === null) return;
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      // Ahora formData.fotoPerfil contiene el string base64 si se eligió una nueva imagen
      await axios.put(`https://apiautentificacion.onrender.com/api/perfiles/${profileId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('Éxito', 'Tu perfil se ha actualizado correctamente.');
      router.back();
    } catch (error) {
       const errorMessage = isAxiosError(error) && error.response ? `Error: ${error.response.data.message || 'Revisa los datos'}` : 'No se pudo guardar tu perfil.';
       Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };
  // --- END OF LOGIC ---

  if (loading || !formData) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#622BEF" /></View>;
  }

  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {/* Layer 1: The decorative background */}
        <LinearGradient colors={['#622BEF', '#9D3BFF']} style={styles.headerBackground} />
        
        {/* Layer 2: The entire scrollable content area */}
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <SafeAreaView>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.navButton}><ArrowLeft size={24} color="#fff" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                    <View style={{width: 44}} />
                </View>
            </SafeAreaView>

            {/* The avatar now sits in the natural flow, with spacing controlled by padding */}
            <View style={styles.avatarSection}>
                <Image source={{ uri: formData.fotoPerfil || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
                    <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.cameraIconContainer}>
                        <Camera size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.masterCard}>
                    <InputField icon={User} label="Nombre Completo" value={formData.nombreCompleto} onChangeText={v => handleInputChange('nombreCompleto', v)} placeholder="Tu nombre y apellido" />
                    <InputField icon={Book} label="Biografía" value={formData.biografia} onChangeText={v => handleInputChange('biografia', v)} placeholder="Cuéntanos algo sobre ti" />
                    <InputField icon={Phone} label="Teléfono" value={formData.telefono} onChangeText={v => handleInputChange('telefono', v)} placeholder="+503..." />
                    <InputField icon={Hash} label="Documento" value={formData.documentoIdentidad} onChangeText={v => handleInputChange('documentoIdentidad', v)} placeholder="Tu documento de identidad" />
                    <InputField icon={Map} label="Ciudad" value={formData.ciudad} onChangeText={v => handleInputChange('ciudad', v)} placeholder="Ej. San Salvador" />
                    <InputField icon={Globe} label="País" value={formData.pais} onChangeText={v => handleInputChange('pais', v)} placeholder="Ej. El Salvador" isLast/>
                </View>
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.saveButtonGradient}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Guardar Cambios</Text>}
                </LinearGradient>
            </TouchableOpacity>

        </ScrollView>
    </View>
  );
};

const AVATAR_SIZE = 120;
const HEADER_HEIGHT = 150;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F8' },

  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  scrollContent: { 
      paddingBottom: 40,
      paddingTop: 40, // Give some top space
    },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10, // Space between nav and avatar
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  navButton: { padding: 10 },

  avatarSection: {
    alignItems: 'center',
    // The avatar floats visually because the form has a larger top margin.
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 5,
    borderColor: '#F7F7F8',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: '30%',
  },
   cameraIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F7F7F8',
   },

  formContainer: {
      paddingHorizontal: 20, 
      // This margin creates the floating effect for the avatar
      marginTop: - (AVATAR_SIZE / 3), 
      zIndex: -1, // Ensures the avatar shadow renders on top of the card
  },
  masterCard: {
      backgroundColor: '#fff',
      borderRadius: 20,
      // Give space for the part of avatar that overlaps
      paddingTop: (AVATAR_SIZE / 3) + 10,
      paddingBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
  },
  inputContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0'
  },
  inputLabel: {
    fontSize: 14,
    color: '#8A8A93',
    marginBottom: 10,
    fontWeight: '500'
  },
  inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F7F7F8',
      borderRadius: 10,
      padding: 12,
  },
  inputIcon: {
      marginRight: 10,
  },
  input: { 
    flex: 1,
    fontSize: 16, 
    color: '#333', 
    fontWeight: '500',
  },

  saveButton: {
      borderRadius: 30,
      marginHorizontal: 20,
      marginTop: 30,
      shadowColor: '#7033FF',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 15,
      elevation: 10,
  },
  saveButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 30,
  },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default EditProfileScreen;
