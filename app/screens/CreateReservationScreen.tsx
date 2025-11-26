
import React, { useState, useEffect, useMemo } from 'react';
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
import { Ionicons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateReservationScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [canchaId, setCanchaId] = useState<string | null>(null);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState('1.5');
  const [totalAmount, setTotalAmount] = useState('55.00');
  const [mensaje, setMensaje] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (id) {
      setCanchaId(id as string);
    }
  }, [id]);

  const endTime = useMemo(() => {
    const durationHours = parseFloat(duration);
    if (!isNaN(durationHours)) {
      const endTime = new Date(time.getTime() + durationHours * 60 * 60000);
      return endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '--:--';
  }, [time, duration]);

  const handleCreateReservation = async () => {
    const durationHours = parseFloat(duration);
    const amount = parseFloat(totalAmount);

    if (isNaN(durationHours) || isNaN(amount)) {
      Alert.alert('Datos Inválidos', 'La duración y el monto deben ser números.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener el ID de usuario. Por favor, inicia sesión.');
        router.replace('/login');
        return;
      }

      const reservationData = {
        cancha_id: parseInt(canchaId!, 10),
        equipo_id: null,
        usuario_solicitante_id: parseInt(userId, 10),
        fecha_reserva: date.toISOString().split('T')[0],
        hora_inicio: time.toTimeString().split(' ')[0],
        hora_fin: new Date(time.getTime() + durationHours * 60 * 60000).toTimeString().split(' ')[0],
        duracion_horas: durationHours,
        monto_total: amount,
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

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setTime(selectedTime);
  };

  return (
    <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="chevron-left" size={30} color="#fff" />
      </TouchableOpacity>
      
      <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{flex: 1}}
      >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <Text style={styles.headerTitle}>Reservar Cancha</Text>
              <Text style={styles.headerSubtitle}>Ingresa los detalles de tu próxima reserva</Text>

              <View style={styles.glassCard}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={22} color="#E0D7FF" style={styles.icon} />
                  <View style={styles.textInputWrapper}>
                    <Text style={styles.inputLabel}>Fecha</Text>
                    <Text style={styles.inputText}>{date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric'})}</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.divider} />

                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputContainer}>
                  <Ionicons name="time-outline" size={22} color="#E0D7FF" style={styles.icon} />
                  <View style={styles.textInputWrapper}>
                    <Text style={styles.inputLabel}>Hora de Inicio</Text>
                    <Text style={styles.inputText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.glassCard}>
                <View style={styles.detailsRow}>
                  <View style={[styles.inputContainer, styles.detailsItem]}>
                    <Ionicons name="hourglass-outline" size={22} color="#E0D7FF" style={styles.icon} />
                    <View style={styles.textInputWrapper}>
                      <Text style={styles.inputLabel}>Duración (horas)</Text>
                      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholderTextColor="#E0D7FF" />
                    </View>
                  </View>
                  <View style={[styles.inputContainer, styles.detailsItem]}>
                    <Ionicons name="time-outline" size={22} color="#E0D7FF" style={styles.icon} />
                    <View style={styles.textInputWrapper}>
                      <Text style={styles.inputLabel}>Hora Fin</Text>
                      <Text style={styles.inputText}>{endTime}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.inputContainer}>
                  <Ionicons name="cash-outline" size={22} color="#E0D7FF" style={styles.icon} />
                  <View style={styles.textInputWrapper}>
                    <Text style={styles.inputLabel}>Monto Total</Text>
                    <TextInput style={styles.input} value={totalAmount} onChangeText={setTotalAmount} keyboardType="numeric" placeholderTextColor="#E0D7FF" />
                  </View>
                </View>
              </View>

              <View style={styles.glassCard}>
                <View style={[styles.inputContainer, { alignItems: 'flex-start'}]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color="#E0D7FF" style={[styles.icon, {marginTop: 15}]} />
                  <View style={styles.textInputWrapper}>
                    <Text style={styles.inputLabel}>Mensaje Adicional</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={mensaje} onChangeText={setMensaje} multiline placeholder="Opcional" placeholderTextColor="#E0D7FF" />
                  </View>
                </View>
              </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={handleCreateReservation}>
              <Text style={styles.buttonText}>Confirmar y Reservar</Text>
            </TouchableOpacity>
          </View>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker testID="datePicker" value={date} mode="date" display="default" onChange={onDateChange} />
      )}
      {showTimePicker && (
        <DateTimePicker testID="timePicker" value={time} mode="time" is24Hour={true} display="default" onChange={onTimeChange} />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 5,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
    paddingBottom: 120, // Space for the footer button
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0D7FF',
    textAlign: 'center',
    marginBottom: 30,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsItem: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  textInputWrapper: {
    flex: 1,
  },
  icon: {
    marginRight: 15,
  },
  inputLabel: {
    color: '#E0D7FF',
    fontSize: 12,
    marginBottom: 4,
  },
  inputText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0, // Fix for vertical alignment
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Safe area for iPhone
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: '#5D23E4',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateReservationScreen;
