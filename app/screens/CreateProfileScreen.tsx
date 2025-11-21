
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const initializeProfile = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setProfileData({
          nombreCompleto: '',
          telefono: '',
          documentoIdentidad: '',
          fechaNacimiento: new Date().toISOString().split('T')[0],
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

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    handleInputChange('fechaNacimiento', currentDate.toISOString().split('T')[0]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleInputChange('fotoPerfil', result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!profileData) return;

    // Basic validation
    for (const key in profileData) {
      if (key !== 'fotoPerfil' && key !== 'biografia' && !profileData[key as keyof ProfileData]) {
        Alert.alert('Campo requerido', `Por favor, rellena el campo ${key}`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/login');
        return;
      }

      await axios.post('https://apiautentificacion.onrender.com/api/perfiles', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await AsyncStorage.setItem('profileExists', 'true');
      Alert.alert('Éxito', 'Perfil creado correctamente.');
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', 'No se pudo crear el perfil.');
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profileData) {
    return <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.center}><ActivityIndicator size="large" color="#fff" /></LinearGradient>;
  }

  return (
    <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              <Image source={{ uri: profileData.fotoPerfil || 'https://via.placeholder.com/150' }} style={styles.avatar} />
              <View style={styles.cameraIcon}>
                <Feather name="camera" size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.card}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput style={styles.input} value={profileData.nombreCompleto} onChangeText={text => handleInputChange('nombreCompleto', text)} placeholder="Nombre Completo" placeholderTextColor="#8a8d97" />

                <Text style={styles.label}>Teléfono</Text>
                <TextInput style={styles.input} value={profileData.telefono} onChangeText={text => handleInputChange('telefono', text)} placeholder="+503 XXXX-XXXX" placeholderTextColor="#8a8d97" keyboardType="phone-pad"/>

                <Text style={styles.label}>Documento de Identidad</Text>
                <TextInput style={styles.input} value={profileData.documentoIdentidad} onChangeText={text => handleInputChange('documentoIdentidad', text)} placeholder="XXXXXXXX-X" placeholderTextColor="#8a8d97" />
                
                <Text style={styles.label}>Fecha de Nacimiento</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                    <Text style={{color: '#fff'}}>{new Date(profileData.fechaNacimiento).toLocaleDateString('es-ES')}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    />
                )}

                <Text style={styles.label}>Género</Text>
                <TextInput style={styles.input} value={profileData.genero} onChangeText={text => handleInputChange('genero', text)} placeholder="Masculino, Femenino, Otro" placeholderTextColor="#8a8d97" />

                <Text style={styles.label}>Biografía</Text>
                <TextInput style={[styles.input, styles.textArea]} value={profileData.biografia} onChangeText={text => handleInputChange('biografia', text)} placeholder="Cuéntanos algo sobre ti" placeholderTextColor="#8a8d97" multiline />

                <Text style={styles.label}>Ciudad</Text>
                <TextInput style={styles.input} value={profileData.ciudad} onChangeText={text => handleInputChange('ciudad', text)} placeholder="Tu ciudad" placeholderTextColor="#8a8d97" />

                <Text style={styles.label}>País</Text>
                <TextInput style={styles.input} value={profileData.pais} onChangeText={text => handleInputChange('pais', text)} placeholder="Tu país" placeholderTextColor="#8a8d97" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveButtonText}>Crear Perfil</Text>}
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
        paddingBottom: 50,
        paddingTop: 50
    },
    form: {
        paddingHorizontal: 20,
        paddingTop: 20
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#8e44ad',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#8e44ad',
        borderRadius: 15,
        padding: 5
    },
    card: {
        backgroundColor: '#2a2d3e',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        color: '#aab1d6',
        marginBottom: 8,
        marginTop: 10
    },
    input: {
        backgroundColor: '#1c1e2a',
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
});

export default CreateProfileScreen;
