// Ejemplo de cómo configurar el userId en AsyncStorage
// Este código debe ejecutarse después del login exitoso del usuario

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guardar el userId del usuario logueado
 * Llamar esta función después de un login exitoso
 */
export const saveUserId = async (userId: number) => {
  try {
    await AsyncStorage.setItem('userId', userId.toString());
    console.log('UserId guardado exitosamente:', userId);
  } catch (error) {
    console.error('Error al guardar userId:', error);
  }
};

/**
 * Obtener el userId guardado
 */
export const getUserId = async (): Promise<number | null> => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  } catch (error) {
    console.error('Error al obtener userId:', error);
    return null;
  }
};

/**
 * Eliminar el userId (logout)
 */
export const clearUserId = async () => {
  try {
    await AsyncStorage.removeItem('userId');
    console.log('UserId eliminado');
  } catch (error) {
    console.error('Error al eliminar userId:', error);
  }
};

// Ejemplo de uso en tu pantalla de login:
/*
const handleLoginSuccess = async (userId: number) => {
  await saveUserId(userId);
  // Navegar a la pantalla de mensajería
  router.push('/screens/MessagingEntryScreen');
};
*/
