
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios, { isAxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define la interfaz para los datos del perfil (corregida)
interface ProfileData {
  usuarioId: number;
  nombreCompleto: string;
  telefono: string;
  documentoIdentidad: string;
  fechaNacimiento: string;
  genero: string;
  fotoPerfil: string;
  biografia: string;
  ciudad: string;
  pais: string;
}

// Usamos un tipo parcial para el estado inicial, ya que usuarioId se carga de forma asíncrona
type FormState = Omit<ProfileData, 'usuarioId'> & { usuarioId: number | null };

const CreateProfileScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>({
    usuarioId: null,
    nombreCompleto: '',
    telefono: '',
    documentoIdentidad: '',
    fechaNacimiento: new Date().toISOString().split('T')[0],
    genero: '',
    biografia: '',
    ciudad: '',
    pais: '',
    fotoPerfil: ''
  });
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const initializeProfile = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setFormData(prev => ({ ...prev, usuarioId: parseInt(userId, 10) }));
      } else {
        Alert.alert('Error', 'No se pudo encontrar el ID de usuario. Por favor, inicie sesión de nuevo.');
        router.replace('/login');
      }
      setLoading(false);
    };
    initializeProfile();
  }, []);

  const handleInputChange = (field: keyof Omit<FormState, 'usuarioId'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      handleInputChange('fotoPerfil', result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formData || formData.usuarioId === null) {
      Alert.alert('Error', 'El ID de usuario no está disponible. No se puede crear el perfil.');
      return;
    }

    // Construir el payload con la estructura correcta para la API
    const payload: ProfileData = {
      usuarioId: formData.usuarioId,
      nombreCompleto: formData.nombreCompleto,
      telefono: formData.telefono,
      documentoIdentidad: formData.documentoIdentidad,
      fechaNacimiento: formData.fechaNacimiento,
      genero: formData.genero,
      // La API espera un valor para fotoPerfil, proporcionamos uno por defecto si está vacío
      fotoPerfil: formData.fotoPerfil || 'https://ejemplo.com/foto.jpg',
      biografia: formData.biografia,
      ciudad: formData.ciudad,
      pais: formData.pais,
    };

    // Validación
    for (const [key, value] of Object.entries(payload)) {
      // Permitimos que biografia y fotoPerfil estén vacíos
      if (key !== 'biografia' && key !== 'fotoPerfil' && !value) {
        Alert.alert('Campo Requerido', `Por favor, complete el campo: ${key}`);
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

      await axios.post('https://apiautentificacion.onrender.com/api/perfiles', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await AsyncStorage.setItem('profileExists', 'true');
      Alert.alert('Éxito', 'Perfil creado correctamente.');
      router.replace('/');

    } catch (err) {
      let errorMessage = 'No se pudo crear el perfil.';
      if (isAxiosError(err) && err.response) {
        errorMessage += `\nError: ${JSON.stringify(err.response.data)}`;
        console.error("Server Response:", err.response.data);
      }
      Alert.alert('Error', errorMessage);
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || formData.usuarioId === null) {
    return <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.center}><ActivityIndicator size="large" color="#fff" /></LinearGradient>;
  }

  return (
    <LinearGradient colors={['#1c1e2a', '#2a2d3e']} style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>Crear Perfil</Text>
        <Text style={styles.headerSubtitle}>Completa tus datos para continuar</Text>

        <View style={styles.form}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              <Image source={{ uri: formData.fotoPerfil || undefined }} style={styles.avatar} />
              <View style={styles.cameraIcon}>
                <Feather name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.card}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput style={styles.input} value={formData.nombreCompleto} onChangeText={text => handleInputChange('nombreCompleto', text)} placeholder="Escribe tu nombre completo" placeholderTextColor="#8a8d97" />

                <Text style={styles.label}>Teléfono</Text>
                <TextInput style={styles.input} value={formData.telefono} onChangeText={text => handleInputChange('telefono', text)} placeholder="+503 XXXX-XXXX" placeholderTextColor="#8a8d97" keyboardType="phone-pad"/>

                <Text style={styles.label}>Documento de Identidad</Text>
                <TextInput style={styles.input} value={formData.documentoIdentidad} onChangeText={text => handleInputChange('documentoIdentidad', text)} placeholder="XXXXXXXX-X" placeholderTextColor="#8a8d97" />
                
                <Text style={styles.label}>Fecha de Nacimiento</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                    <Text style={{color: formData.fechaNacimiento ? '#fff' : '#8a8d97'}}>{new Date(formData.fechaNacimiento).toLocaleDateString('es-ES')}</Text>
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
                <TextInput style={styles.input} value={formData.genero} onChangeText={text => handleInputChange('genero', text)} placeholder="Masculino, Femenino, Otro" placeholderTextColor="#8a8d97" />

                <Text style={styles.label}>Biografía (Opcional)</Text>
                <TextInput style={[styles.input, styles.textArea]} value={formData.biografia} onChangeText={text => handleInputChange('biografia', text)} placeholder="Cuéntanos algo sobre ti..." placeholderTextColor="#8a8d97" multiline />

                <Text style={styles.label}>Ciudad</Text>
                <TextInput style={styles.input} value={formData.ciudad} onChangeText={text => handleInputChange('ciudad', text)} placeholder="Tu ciudad" placeholderTextColor="#8a8d97" />

                <Text style={styles.label}>País</Text>
                <TextInput style={styles.input} value={formData.pais} onChangeText={text => handleInputChange('pais', text)} placeholder="Tu país" placeholderTextColor="#8a8d97" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveButtonText}>Guardar Perfil</Text>}
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
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 5,
    },
    scrollContainer: {
        paddingBottom: 50,
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#aab1d6',
        textAlign: 'center',
        marginBottom: 25,
    },
    form: {
        paddingHorizontal: 20,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: '#8e44ad',
        backgroundColor: '#3a3d51'
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#8e44ad',
        borderRadius: 15,
        padding: 6
    },
    card: {
        backgroundColor: 'rgba(42, 45, 62, 0.8)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20
    },
    label: {
        fontSize: 15,
        color: '#aab1d6',
        marginBottom: 8,
        marginTop: 10,
        fontWeight: '500'
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
        justifyContent: 'center',
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
        marginTop: 10,
        shadowColor: '#8e44ad',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreateProfileScreen;
