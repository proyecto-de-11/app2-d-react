
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Defines the fields that are allowed to be displayed and edited.
// This is a more robust approach than hiding fields.
const VISIBLE_FIELDS = [
  'nombreCompleto',
  'telefono',
  'documentoIdentidad',
  'fechaNacimiento',
  'genero',
  'fotoPerfil',
  'biografia',
  'ciudad',
  'pais',
];

const EditProfileScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<{ [key: string]: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');

      if (!userId || !token) {
        Alert.alert("Error", "No se pudo verificar tu sesión.");
        router.replace('/login');
        return;
      }

      const response = await axios.get(
        `https://apiautentificacion.onrender.com/api/perfiles/usuario/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "No se pudieron cargar los datos de tu perfil.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleUpdate = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');

      await axios.put(
        `https://apiautentificacion.onrender.com/api/perfiles/${userId}`,
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("¡Éxito!", "Tu perfil se ha actualizado correctamente.", [
        { text: "OK", onPress: () => router.back() }
      ]);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "No se pudo actualizar tu perfil. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7033FF" />
        <Text style={styles.loadingText}>Cargando Perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleUpdate} style={styles.saveButton}>
          <Feather name="save" size={24} color="#7033FF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.form}>
          {/* Iterate over the whitelisted fields instead of all keys from the profile */}
          {profile && VISIBLE_FIELDS.map((field) => {
              // Only render if the field exists in the profile data
              if (profile[field] === undefined) return null;

              const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
              
              return (
                <View key={field} style={styles.inputGroup}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    value={String(profile[field])} // Ensure value is a string
                    onChangeText={(text) => handleInputChange(field, text)}
                    placeholder={`Escribe tu ${label.toLowerCase()}`}
                    placeholderTextColor="#C7C7CD"
                    multiline={field === 'biografia'}
                    numberOfLines={field === 'biografia' ? 4 : 1}
                  />
                </View>
              );
            })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={isSaving}>
            <LinearGradient colors={['#7033FF', '#B34CFF']} style={styles.buttonGradient} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
                {isSaving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Guardar Cambios</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8A8A93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF1',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  saveButton: {
    padding: 5,
  },
  form: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDEDF1',
    minHeight: 60,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    textAlignVertical: 'top',
    paddingTop: 20, 
  },
  button: {
    borderRadius: 16,
    marginTop: 15,
    marginHorizontal: 25,
    shadowColor: '#7033FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
  },
  buttonGradient: {
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
