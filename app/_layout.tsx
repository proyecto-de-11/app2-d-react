
import { Stack } from 'expo-router';
import "../global.css";
import { MessagingProvider } from './contexts/MessagingContext';

export default function RootLayout() {

  return (
    <MessagingProvider>
      <Stack>
        <Stack.Screen name="index" options={{headerShown:false}}  />
        <Stack.Screen name="login" options={{headerShown:false }} />
        <Stack.Screen name="screen_a/ListUsuarios" options={{headerShown:false }} />
        <Stack.Screen name="screens/ProfileScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/EditProfileScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/CreateAccountScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/CreateProfileScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/MessagingEntryScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/SetUserIdScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/ChatScreen" options={{headerShown:false }} />
        <Stack.Screen name="(tabs)" options={{headerShown:false }} />
        <Stack.Screen name="screens/CreateReservationScreen" options={{headerShown:false }} />
        <Stack.Screen name="screens/MyReservationsScreen" options={{headerShown:false }} />
        <Stack.Screen name='screens/publicProfileScreen' options={{headerShown:false }} />
        <Stack.Screen name="screens/DetalleEquipoScreen" options={{ headerShown: false, title: 'Detalle Equipo' }} />
        <Stack.Screen name="screens/CrearEquipoScreen" options={{ headerShown: false, title: 'Crear Equipo' }} />
        <Stack.Screen name="screens/MisEquiposScreen" options={{ headerShown: false, title: 'Mis Equipos' }} />
        <Stack.Screen name="screens/BuscarEquiposScreen" options={{ headerShown: false, title: 'Buscar Equipos' }} />
        <Stack.Screen name="screens/SolicitudesEquipoScreen" options={{ headerShown: false, title: 'Solicitudes de Unión' }} />
      
      </Stack>
    </MessagingProvider>
  );
}
