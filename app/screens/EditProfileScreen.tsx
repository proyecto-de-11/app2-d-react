
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ======================================================================================
// VIBRANT EDITION - EditProfileScreen
// - A modern and cohesive UI that matches the new Profile and Chat screens.
// - Logic is 100% untouched.
// ======================================================================================

interface ProfileData {
  id?: number;
  nombreCompleto: string;
  telefono: string;
  documentoIdentidad: string;
  fechaNacimiento: string;
  genero: string;
  biografia: string;
  ciudad: string;
  pais: string;
  fotoPerfil: string;
  usuario: { id: number };
}

const commonCardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 5,
};


const EditProfileScreen = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // --- LOGIC IS UNTOUCHED ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');

        if (!userId || !token) {
          router.replace('/login');
          return;
        }

        const response = await axios.get(`https://apiautentificacion.onrender.com/api/perfiles/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
        setIsCreating(false);

      } catch (err) {
        const error = err as AxiosError;
        if (error.response && error.response.status === 404) {
          setIsCreating(true);
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            setProfileData({
              nombreCompleto: '',
              telefono: '',
              documentoIdentidad: '',
              fechaNacimiento: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
              genero: '',
              biografia: '',
              ciudad: '',
              pais: '',
              fotoPerfil: '',
              usuario: { id: parseInt(userId, 10) }
            });
          }
        } else {
          setError('Failed to load profile data.');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

    const handleSave = async () => {
        if (!profileData) return;

        // Basic Validation
        if (!profileData.nombreCompleto.trim() || !profileData.documentoIdentidad.trim()) {
            Alert.alert('Campos incompletos', 'Por favor, completa tu nombre y documento.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                 router.replace('/login');
                 return;
            };

            const url = isCreating
                ? `https://apiautentificacion.onrender.com/api/perfiles`
                : `https://apiautentificacion.onrender.com/api/perfiles/${profileData.id}`;
            
            const method = isCreating ? 'post' : 'put';

            await axios[method](url, profileData, { headers: { Authorization: `Bearer ${token}` } });

            await AsyncStorage.setItem('profileExists', 'true');
            Alert.alert('Éxito', 'Perfil guardado correctamente.', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (err) {
            Alert.alert('Error', 'No se pudo guardar el perfil. Inténtalo de nuevo.');
            console.error("Save error:", err);
        } finally {
            setLoading(false);
        }
    };


  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };
  // --- END OF UNTOUCHED LOGIC ---

  if (loading || !profileData) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#7033FF" />
        </View>
    );
  }

  // A reusable input component for this screen
  const FormInput = ({ label, value, onChangeText, placeholder, ...props }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A9A9B8"
            {...props}
        />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
            <ArrowLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isCreating ? 'Crear Perfil' : 'Editar Perfil'}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.navButton}>
            <Save size={24} color="#7033FF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.profilePicSection}>
                <Image source={{ uri: profileData.fotoPerfil || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <FormInput
                    label="URL de tu Foto de Perfil"
                    value={profileData.fotoPerfil}
                    onChangeText={(text: string) => handleInputChange('fotoPerfil', text)}
                    placeholder="https://example.com/photo.jpg"
                />
            </View>
            
            <View style={styles.card}>
                <FormInput
                    label="Nombre Completo"
                    value={profileData.nombreCompleto}
                    onChangeText={(text: string) => handleInputChange('nombreCompleto', text)}
                    placeholder="Tu nombre y apellido"
                />
                 <View style={styles.divider} />
                <FormInput
                    label="Biografía"
                    value={profileData.biografia}
                    onChangeText={(text: string) => handleInputChange('biografia', text)}
                    placeholder="Cuéntanos un poco sobre ti..."
                    multiline
                    style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
                />
            </View>
            
            <View style={styles.card}>
                 <FormInput
                    label="Teléfono"
                    value={profileData.telefono}
                    onChangeText={(text: string) => handleInputChange('telefono', text)}
                    placeholder="Tu número de teléfono"
                    keyboardType="phone-pad"
                />
                <View style={styles.divider} />
                <FormInput
                    label="Documento de Identidad"
                    value={profileData.documentoIdentidad}
                    onChangeText={(text: string) => handleInputChange('documentoIdentidad', text)}
                    placeholder="Tu documento"
                />
                 <View style={styles.divider} />
                <FormInput
                    label="Ciudad"
                    value={profileData.ciudad}
                    onChangeText={(text: string) => handleInputChange('ciudad', text)}
                    placeholder="Ciudad donde vives"
                />
                 <View style={styles.divider} />
                 <FormInput
                    label="País"
                    value={profileData.pais}
                    onChangeText={(text: string) => handleInputChange('pais', text)}
                    placeholder="País de residencia"
                />
            </View>
            
             <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.saveButtonGradient}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                       <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>

        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F2FB',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F2FB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EDEDF1',
    },
    navButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    scrollContainer: {
        padding: 20,
    },
    profilePicSection: {
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        ...commonCardShadow
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 20,
        marginBottom: 20,
        ...commonCardShadow
    },
    inputGroup: {
        width: '100%',
        paddingVertical: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#F4F2FB',
        color: '#1A1A1A',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E8E6EA',
    },
    divider: {
        height: 1,
        backgroundColor: '#EDEDF1',
    },
    saveButton: {
        borderRadius: 25,
        marginTop: 10,
        shadowColor: '#7033FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    saveButtonGradient: {
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});


export default EditProfileScreen;
