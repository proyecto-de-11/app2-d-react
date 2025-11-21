
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define la interfaz para los datos del perfil
interface ProfileData {
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

const CreateProfileScreen = () => {
  const router = useRouter();
  // Especifica el tipo para el estado profileData
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeProfile = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setProfileData({
          nombreCompleto: '',
          telefono: '',
          documentoIdentidad: '',
          fechaNacimiento: new Date().toISOString(),
          genero: '',
          biografia: '',
          ciudad: '',
          pais: '',
          fotoPerfil: '',
          usuario: { id: parseInt(userId, 10) }
        });
      } else {
        router.replace('/login');
      }
      setLoading(false);
    };

    initializeProfile();
  }, []);

  const handleSave = async () => {
    if (!profileData) return;

    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.replace('/login');
          return;
        }

        await axios.post(`https://apiautentificacion.onrender.com/api/perfiles`,
            profileData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        await AsyncStorage.setItem('profileExists', 'true');
        Alert.alert('Éxito', 'Perfil creado correctamente.');
        router.replace('/');

    } catch (err) {
        Alert.alert('Error', 'No se pudo crear el perfil.');
        console.error("Save error:", err);
    }
};

  // Define los tipos para los parámetros de la función
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  if (loading || !profileData) {
    return <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.center}><ActivityIndicator size="large" color="#fff" /></LinearGradient>;
  }

  return (
    <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>          
          <Text style={styles.headerTitle}>Crear Perfil</Text>
        </View>
        
        <View style={styles.form}>
            <Image source={{ uri: profileData.fotoPerfil || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            <TouchableOpacity onPress={() => { /* Lógica para seleccionar imagen */ }}>
                 <Text style={styles.changeAvatarText}>Cambiar Foto</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput style={styles.input} value={profileData.nombreCompleto} onChangeText={text => handleInputChange('nombreCompleto', text)} placeholder="Nombre Completo" placeholderTextColor="#8a8d97" />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput style={styles.input} value={profileData.telefono} onChangeText={text => handleInputChange('telefono', text)} placeholder="Teléfono" placeholderTextColor="#8a8d97" keyboardType="phone-pad"/>

            <Text style={styles.label}>Documento de Identidad</Text>
            <TextInput style={styles.input} value={profileData.documentoIdentidad} onChangeText={text => handleInputChange('documentoIdentidad', text)} placeholder="Documento de Identidad" placeholderTextColor="#8a8d97" />

            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <TextInput style={styles.input} value={new Date(profileData.fechaNacimiento).toLocaleDateString('es-ES')} onChangeText={text => handleInputChange('fechaNacimiento', text)} placeholder="YYYY-MM-DD" placeholderTextColor="#8a8d97" />
            
            <Text style={styles.label}>Género</Text>
            <TextInput style={styles.input} value={profileData.genero} onChangeText={text => handleInputChange('genero', text)} placeholder="Género" placeholderTextColor="#8a8d97" />

            <Text style={styles.label}>Biografía</Text>
            <TextInput style={[styles.input, styles.textArea]} value={profileData.biografia} onChangeText={text => handleInputChange('biografia', text)} placeholder="Biografía" placeholderTextColor="#8a8d97" multiline />

            <Text style={styles.label}>Ciudad</Text>
            <TextInput style={styles.input} value={profileData.ciudad} onChangeText={text => handleInputChange('ciudad', text)} placeholder="Ciudad" placeholderTextColor="#8a8d97" />

            <Text style={styles.label}>País</Text>
            <TextInput style={styles.input} value={profileData.pais} onChangeText={text => handleInputChange('pais', text)} placeholder="País" placeholderTextColor="#8a8d97" />

            <Text style={styles.label}>URL Foto de Perfil</Text>
            <TextInput style={styles.input} value={profileData.fotoPerfil} onChangeText={text => handleInputChange('fotoPerfil', text)} placeholder="URL de la imagen" placeholderTextColor="#8a8d97" />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Crear Perfil</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        paddingVertical: 30,
        paddingHorizontal: 15,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        color: '#aab1d6',
        marginBottom: 8,
        marginTop: 10
    },
    input: {
        backgroundColor: '#2a2d3e',
        color: '#fff',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#3a3d51',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#8e44ad',
        borderRadius: 10,
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 16
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#8e44ad'
    },
    changeAvatarText: {
        color: '#8e44ad',
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16
    }
});

export default CreateProfileScreen;
