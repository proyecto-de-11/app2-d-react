
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
    
    >
      <Stack.Screen name="index" options={{headerShown:false}}  />
      <Stack.Screen name="screens/LoginScreen" options={{ title: 'Iniciar Sesión' }} />
      <Stack.Screen name="screens/HomeScreen" options={{ title: 'Inicio' }} />
    </Stack>
  );
}
