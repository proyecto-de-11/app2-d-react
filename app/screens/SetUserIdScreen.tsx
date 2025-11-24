import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SetUserIdScreen() {
  const [userId, setUserId] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Por favor ingresa un ID de usuario');
      return;
    }

    try {
      await AsyncStorage.setItem('userId', userId.trim());
      Alert.alert('Éxito', 'User ID guardado correctamente', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/profiles'),
        },
      ]);
    } catch (error) {
      console.error('Error al guardar userId:', error);
      Alert.alert('Error', 'No se pudo guardar el User ID');
    }
  };

  const handleSkip = () => {
    router.push('/(tabs)/profiles');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configurar User ID</Text>
        <Text style={styles.subtitle}>
          Para usar el sistema de mensajería, necesitas configurar tu User ID
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu User ID (ej: 1, 2, 3...)"
          value={userId}
          onChangeText={setUserId}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Guardar y Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Saltar (solo para testing)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#0084ff',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});
