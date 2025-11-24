# Sistema de Mensajería WhatsApp - React Native

Sistema completo de mensajería en tiempo real tipo WhatsApp implementado en React Native con Expo.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Ejecutar la Aplicación

```bash
npm start
```

Luego escanea el código QR con Expo Go (Android) o la app de Cámara (iOS).

## 📱 Características

- ✅ **Perfiles Públicos**: Lista de todos los usuarios disponibles para chatear
- ✅ **Mis Chats**: Conversaciones activas del usuario
- ✅ **Mensajería en Tiempo Real**: WebSocket para mensajes instantáneos
- ✅ **Modal de Conversación**: Interfaz tipo WhatsApp para chatear
- ✅ **Verificación Automática**: Detecta chats existentes o crea nuevos
- ✅ **TypeScript**: Código completamente tipado

## 🏗️ Arquitectura

### Servicios

- **messagingService**: Llamadas HTTP a las APIs
- **socketService**: Conexión WebSocket para tiempo real

### Pantallas

1. **PublicProfilesScreen**: Lista de usuarios disponibles
2. **MyChatsScreen**: Conversaciones activas
3. **ChatModal**: Ventana de conversación individual

### Navegación

- Tabs para cambiar entre "Perfiles" y "Mis Chats"
- Modal overlay para conversaciones

## 🔧 Configuración

### Requisito Previo

El usuario debe tener su `userId` guardado en AsyncStorage:

```javascript
await AsyncStorage.setItem('userId', '1');
```

### APIs Utilizadas

- **Mensajería**: `https://apimensajeria.onrender.com/api`
- **Autenticación**: `https://apiautentificacion.onrender.com/api`

## 📖 Uso

1. **Ver Perfiles**: Navega a la tab "Perfiles"
2. **Iniciar Chat**: Presiona el ícono de mensaje en un perfil
3. **Enviar Mensaje**: Escribe y envía mensajes en tiempo real
4. **Ver Chats**: Navega a "Mis Chats" para ver conversaciones activas

## 🛠️ Tecnologías

- React Native + Expo
- TypeScript
- Socket.io Client
- Expo Router
- AsyncStorage
- Lucide React Native (íconos)

## 📁 Estructura de Archivos

```
app/
├── (tabs)/                    # Navegación por tabs
│   ├── _layout.tsx
│   ├── profiles.tsx
│   └── chats.tsx
├── contexts/
│   └── MessagingContext.tsx   # Estado global
├── screens/
│   ├── PublicProfilesScreen.tsx
│   ├── MyChatsScreen.tsx
│   ├── ChatModal.tsx
│   ├── MessagingEntryScreen.tsx
│   └── components/
│       └── MessageBubble.tsx
services/
├── messagingService.ts        # API HTTP
└── socketService.ts           # WebSocket
types/
└── messaging-types.ts         # Tipos TypeScript
```

## 🎨 Diseño

- Interfaz inspirada en WhatsApp
- Burbujas de mensaje diferenciadas por emisor
- Colores: Azul (#0084ff) para mensajes propios, gris para ajenos
- Scroll automático a nuevos mensajes

## 📝 Documentación Completa

Para más detalles sobre la implementación, consulta:
- [Especificación Original](file:///home/alan/Escritorio/app2-d-react/types/respuesta%20definitiva.md)
- [Plan de Implementación](file:///home/alan/.gemini/antigravity/brain/30f1c744-d6e7-4b29-8699-d10496bfa26b/implementation_plan.md)
- [Walkthrough](file:///home/alan/.gemini/antigravity/brain/30f1c744-d6e7-4b29-8699-d10496bfa26b/walkthrough.md)

## ✅ Estado del Proyecto

Todas las funcionalidades principales están implementadas y funcionando:
- ✅ Carga de perfiles públicos
- ✅ Gestión de chats
- ✅ Mensajería en tiempo real
- ✅ Navegación completa
- ✅ Estados de carga y error

## 🤝 Contribuir

Este proyecto sigue las especificaciones definidas en `types/respuesta definitiva.md`.
