
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  SafeAreaView,
  Platform,
  Modal,
  Alert
} from 'react-native';
import axios, { AxiosError } from 'axios';
import { Calendar, Clock, DollarSign, MessageSquare, Tag, AlertCircle, Inbox, ArrowLeft, X, Trash2 } from 'lucide-react-native';
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
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Fetches reservations from the API
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Reservation[]>('https://apicanchasyreservas.onrender.com/api/reservas');
      
      if (!Array.isArray(response.data)) {
        throw new Error("La API no devolvió un formato de datos esperado.");
      }

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
  
  const handleCardPress = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedReservation(null);
  };
  
  const handleDeleteReservation = async () => {
    if (!selectedReservation) return;

    Alert.alert(
      "Confirmar Cancelación",
      "¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.",
      [
        { text: "No, mantener", style: "cancel" },
        {
          text: "Sí, Cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`https://apicanchasyreservas.onrender.com/api/reservas/${selectedReservation.id}`);
              setReservations(prev => prev.filter(r => r.id !== selectedReservation.id));
              handleCloseModal();
              Alert.alert("Éxito", "La reserva ha sido cancelada.");
            } catch (error) {
              console.error("Error deleting reservation:", error);
              Alert.alert("Error", "No se pudo cancelar la reserva. Inténtalo de nuevo.");
            }
          }
        }
      ]
    );
  };


  // Renders each reservation item in the list
  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <TouchableOpacity 
      style={styles.reservationCard} 
      onPress={() => handleCardPress(item)}
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
          <View style={styles.emptyContainer}>
            <Inbox size={80} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.emptyTitle}>No tienes reservas</Text>
            <Text style={styles.emptySubtitle}>
                Parece que aún no has agendado ninguna cancha. ¡Anímate a organizar un partido!
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => router.push('/')}>
                <Text style={styles.createButtonText}>Explorar Canchas</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedReservation && (
          <Modal
              animationType="fade"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={handleCloseModal}
          >
              <View style={styles.modalBackdrop}>
                  <View style={styles.modalContainer}>
                      <TouchableOpacity style={styles.modalCloseIcon} onPress={handleCloseModal}>
                        <X size={24} color="#888" />
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Reserva para Cancha {selectedReservation.cancha_id}</Text>
                      
                      <View style={styles.modalContent}>
                        <View style={styles.modalDetailRow}>
                            <Calendar size={20} color="#5D23E4" />
                            <Text style={styles.modalDetailLabel}>Fecha:</Text>
                            <Text style={styles.modalDetailValue}>{new Date(selectedReservation.fecha_reserva).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                        </View>
                        
                        <View style={styles.modalDetailRow}>
                            <Clock size={20} color="#5D23E4" />
                            <Text style={styles.modalDetailLabel}>Hora:</Text>
                            <Text style={styles.modalDetailValue}>{selectedReservation.hora_inicio} - {selectedReservation.hora_fin}</Text>
                        </View>

                        <View style={styles.modalDetailRow}>
                            <DollarSign size={20} color="#5D23E4" />
                            <Text style={styles.modalDetailLabel}>Total:</Text>
                            <Text style={styles.modalDetailValue}>${(selectedReservation.monto_total || 0).toFixed(2)}</Text>
                        </View>

                        {selectedReservation.mensaje_solicitud && (
                            <View style={styles.modalMessageContainer}>
                                <MessageSquare size={20} color="#5D23E4" />
                                <Text style={styles.modalDetailLabel}>Mensaje:</Text>
                                <Text style={styles.modalDetailValue}>{selectedReservation.mensaje_solicitud}</Text>
                            </View>
                        )}
                      </View>
                      
                      <TouchableOpacity style={styles.modalDeleteButton} onPress={handleDeleteReservation}>
                          <Trash2 size={20} color="#fff" />
                          <Text style={styles.modalDeleteButtonText}>Cancelar Reserva</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalConfirmButton} onPress={handleCloseModal}>
                          <Text style={styles.modalConfirmButtonText}>Cerrar</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </Modal>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'android' ? 40 : 20,
    padding: 5,
  },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  infoText: { marginTop: 20, fontSize: 18, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' },
  errorText: { marginTop: 20, fontSize: 18, color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  retryButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: { color: '#B22222', fontSize: 16, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 15, paddingBottom: 20 },
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
  headerIcon: { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 8, marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  cardBody: { padding: 15 },
  cardDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  messageRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
    marginTop: 5,
  },
  cardDetailText: { fontSize: 15, color: '#E0D7FF', marginLeft: 12, flex: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 20, textAlign: 'center' },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30,
    elevation: 10,
  },
  createButtonText: { color: '#5D23E4', fontSize: 16, fontWeight: 'bold' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    elevation: 5,
  },
  modalCloseIcon: { position: 'absolute', top: 10, right: 10, padding: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  modalContent: { marginBottom: 20 },
  modalDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  modalDetailLabel: { fontSize: 16, color: '#555', marginLeft: 10, fontWeight: '500' },
  modalDetailValue: { fontSize: 16, color: '#333', flex: 1, textAlign: 'right' },
  modalMessageContainer: { marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderColor: '#eee', alignItems: 'flex-start' },
  modalConfirmButton: {
    backgroundColor: '#5D23E4',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalConfirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalDeleteButton: {
    flexDirection: 'row',
    backgroundColor: '#D90429',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDeleteButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});

export default MyReservationsScreen;
