
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const CreateReservationScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [canchaId, setCanchaId] = useState<string | null>(null);
  const [fechaReserva, setFechaReserva] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (id) {
      setCanchaId(id as string);
    }
  }, [id]);

  const handleCreateReservation = async () => {
    if (!fechaReserva || !horaInicio || !horaFin) {
      Alert.alert('Campos incompletos', 'Por favor, rellena todos los campos de fecha y hora.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el ID de usuario. Por favor, inicia sesión de nuevo.');
        router.replace('/login');
        return;
      }

      const reservationData = {
        cancha_id: parseInt(canchaId!, 10),
        equipo_id: null,
        usuario_solicitante_id: parseInt(userId, 10),
        fecha_reserva: fechaReserva,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        duracion_horas: 1.5, // TODO: This should be calculated
        monto_total: 55.0, // TODO: This should be calculated or fetched
        mensaje_solicitud: mensaje,
      };

      await axios.post('https://apicanchasyreservas.onrender.com/api/reservas', reservationData);
      Alert.alert('¡Éxito!', 'Tu solicitud de reserva ha sido enviada.', [
        { text: 'OK', onPress: () => router.push('/') },
      ]);
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Error', 'No se pudo crear la reserva. Inténtalo de nuevo.');
    }
  };

  return (
    <LinearGradient colors={['#7033FF', '#330080']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={32} color="white" />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.title}>Crear Reserva</Text>
          <Text style={styles.subtitle}>
            Completa los detalles para solicitar tu cancha.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={22} color="#C7C7CD" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Fecha (YYYY-MM-DD)"
              placeholderTextColor="#C7C7CD"
              value={fechaReserva}
              onChangeText={setFechaReserva}
            />
          </View>

          <View style={styles.timeInputContainer}>
            <View style={[styles.inputContainer, styles.timeInput]}>
              <Ionicons name="time-outline" size={22} color="#C7C7CD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Inicio (HH:MM)"
                placeholderTextColor="#C7C7CD"
                value={horaInicio}
                onChangeText={setHoraInicio}
              />
            </View>
            <View style={[styles.inputContainer, styles.timeInput]}>
              <Ionicons name="time-outline" size={22} color="#C7C7CD" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Fin (HH:MM)"
                placeholderTextColor="#C7C7CD"
                value={horaFin}
                onChangeText={setHoraFin}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="text-outline" size={22} color="#C7C7CD" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mensaje adicional (opcional)"
              placeholderTextColor="#C7C7CD"
              value={mensaje}
              onChangeText={setMensaje}
              multiline
            />
          </View>

          <TouchableOpacity onPress={handleCreateReservation}>
            <LinearGradient
              colors={['#B34CFF', '#7033FF']}
              style={styles.button}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              <Text style={styles.buttonText}>Confirmar Reserva</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 5,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 80, // Adjust for back button
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    color: 'white',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    width: '48%',
  },
  button: {
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateReservationScreen;
