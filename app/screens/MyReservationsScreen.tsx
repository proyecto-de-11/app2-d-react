
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import axios, { AxiosError } from 'axios';
import { Calendar, Clock, DollarSign, MessageSquare, Tag, AlertCircle, Inbox, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Define the shape of a reservation object
interface Reservation {
  id: number;
  cancha_id: number;
  equipo_id: number;
  usuario_solicitante_id: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_horas: number;
  monto_total?: number;
  mensaje_solicitud: string;
}

const MyReservationsScreen = () => {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches reservations from the API
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Reservation[]>('https://apicanchasyreservas.onrender.com/api/reservas');
      
      if (!Array.isArray(response.data)) {
        throw new Error("La API no devolvió un formato de datos esperado.");
      }

      // Map response data and ensure IDs and amounts are numbers
      const formattedReservations = response.data.map((res, index) => ({
        ...res,
        id: res.id ?? index,
        monto_total: res.monto_total != null ? Number(res.monto_total) : 0,
      }));
      setReservations(formattedReservations);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response ? "Error del servidor." : "Error de red. Revisa tu conexión.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Renders each reservation item in the list
  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <TouchableOpacity 
      style={styles.reservationCard} 
      onPress={() =>
        Alert.alert(
          `Reserva para Cancha ${item.cancha_id}`,
          `Fecha: ${item.fecha_reserva}\nHora: ${item.hora_inicio} - ${item.hora_fin}\nTotal: $${(item.monto_total || 0).toFixed(2)}\nMensaje: ${item.mensaje_solicitud || 'Ninguno'}`,
          [{ text: "Cerrar" }]
        )
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerIcon}>
          <Tag size={20} color="#fff" />
        </View>
        <Text style={styles.cardTitle}>Reserva en Cancha {item.cancha_id}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.cardDetailRow}>
          <Calendar size={18} color="#E0D7FF" />
          <Text style={styles.cardDetailText}>{new Date(item.fecha_reserva).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
        <View style={styles.cardDetailRow}>
          <Clock size={18} color="#E0D7FF" />
          <Text style={styles.cardDetailText}>{item.hora_inicio} - {item.hora_fin}</Text>
        </View>
        <View style={styles.cardDetailRow}>
          <DollarSign size={18} color="#E0D7FF" />
          <Text style={styles.cardDetailText}>Monto Total: ${(item.monto_total || 0).toFixed(2)}</Text>
        </View>
        {item.mensaje_solicitud && (
          <View style={[styles.cardDetailRow, styles.messageRow]}>
            <MessageSquare size={18} color="#E0D7FF" />
            <Text style={styles.cardDetailText} numberOfLines={1}>Mensaje: {item.mensaje_solicitud}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Loading state component
  if (loading) {
    return (
      <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.infoText}>Cargando tus reservas...</Text>
      </LinearGradient>
    );
  }

  // Error state component
  if (error) {
    return (
      <LinearGradient colors={['#B22222', '#7C1A1A']} style={styles.centered}>
        <AlertCircle size={48} color="#fff" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchReservations} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Main component render
  return (
    <LinearGradient colors={['#5D23E4', '#A044FF']} style={styles.container}>
      <StatusBar hidden />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.header}>Mis Reservas</Text>
        </View>

        {reservations.length > 0 ? (
          <FlatList
            data={reservations}
            renderItem={renderReservationItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.centeredContent}>
            <Inbox size={64} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.infoText}>No tienes reservas programadas.</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -50, // Adjust to be more centered visually
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 40 : 20, // More padding on top for Android
    paddingBottom: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'android' ? 40 : 20, // Align with paddingTop
    padding: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  infoText: {
    marginTop: 20,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#B22222',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  reservationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardBody: {
    padding: 15,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
    marginTop: 5,
  },
  cardDetailText: {
    fontSize: 15,
    color: '#E0D7FF',
    marginLeft: 12,
    flex: 1,
  },
});

export default MyReservationsScreen;
