import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios, { AxiosError } from 'axios';
import { Calendar, Clock, DollarSign, MessageSquare } from 'lucide-react-native'; // Icons for better representation

interface Reservation {
  id: number; // Assuming there's an ID for each reservation
  cancha_id: number;
  equipo_id: number;
  usuario_solicitante_id: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_horas: number;
  monto_total?: number; // Make monto_total optional as it might be undefined
  mensaje_solicitud: string;
}

const MyReservationsScreen = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Reservation[]>('https://apicanchasyreservas.onrender.com/api/reservas');
      
      // Validate if response.data is an array
      if (!Array.isArray(response.data)) {
        throw new Error("La API no devolvió un formato de datos esperado (no es un arreglo).");
      }

      const reservationsWithIds = response.data.map((res, index) => ({
        ...res,
        id: res.id !== undefined && res.id !== null ? Number(res.id) : index, // Ensure ID is a number, fallback to index
        monto_total: res.monto_total !== undefined && res.monto_total !== null ? Number(res.monto_total) : 0,
      }));
      setReservations(reservationsWithIds);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      const axiosError = err as AxiosError;
      if (axiosError.response) {
        setError(`Error al cargar las reservas: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`);
      } else if (axiosError.request) {
        setError("No se pudo conectar con el servidor de reservas. Revisa tu conexión a internet.");
      } else if (err instanceof Error) {
        setError(`Ocurrió un error inesperado al cargar las reservas: ${err.message}`);
      } else {
        setError("Ocurrió un error desconocido al cargar las reservas.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <TouchableOpacity style={styles.reservationCard} onPress={() =>
      Alert.alert(
        `Reserva para Cancha ${item.cancha_id}`,
        `Fecha: ${item.fecha_reserva}\nHora: ${item.hora_inicio} - ${item.hora_fin}\nTotal: $${(item.monto_total || 0).toFixed(2)}\nMensaje: ${item.mensaje_solicitud}`,
        [{ text: "OK" }]
      )
    }>
      <View style={styles.cardHeader}>
        <Calendar size={20} color="#4CAF50" />
        <Text style={styles.cardTitle}>Cancha {item.cancha_id}</Text>
      </View>
      <View style={styles.cardDetailRow}>
        <Calendar size={16} color="#555" />
        <Text style={styles.cardDetailText}>{item.fecha_reserva}</Text>
      </View>
      <View style={styles.cardDetailRow}>
        <Clock size={16} color="#555" />
        <Text style={styles.cardDetailText}>{item.hora_inicio} - {item.hora_fin}</Text>
      </View>
      <View style={styles.cardDetailRow}>
        <DollarSign size={16} color="#555" />
        <Text style={styles.cardDetailText}>Monto Total: ${(item.monto_total || 0).toFixed(2)}</Text>
      </View>
      {item.mensaje_solicitud && (
        <View style={styles.cardDetailRow}>
          <MessageSquare size={16} color="#555" />
          <Text style={styles.cardDetailText}>Mensaje: {item.mensaje_solicitud}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7033FF" />
        <Text style={styles.loadingText}>Cargando tus reservas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchReservations} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Reservas</Text>
      {reservations.length > 0 ? (
        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noReservationsText}>No tienes reservas programadas en este momento.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#7033FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    marginLeft: 10,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginLeft: 5,
  },
  cardDetailText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 10,
  },
  noReservationsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default MyReservationsScreen;
