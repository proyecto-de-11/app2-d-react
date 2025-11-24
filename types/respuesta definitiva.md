

# **DOCUMENTACIÓN COMPLETA \- SISTEMA DE MENSAJERÍA REACT NATIVE**

## **🎯 OBJETIVO**

Crear un sistema de mensajería tipo WhatsApp con 2 pantallas principales y modales para las conversaciones.

---

## **📱 ESTRUCTURA DE LA APLICACIÓN**

### **USUARIO ACTUAL**

* El `userId` del usuario logueado se obtiene de AsyncStorage:

javascript  
const userId \= await AsyncStorage.getItem('userId');  
\`\`\`

\---

\#\# 🖥️ PANTALLA 1: PERFILES PÚBLICOS

\#\#\# Descripción  
Muestra una lista de todos los usuarios disponibles para chatear.

\#\#\# API Endpoint  
\`\`\`

GET https://apiautentificacion.onrender.com/api/perfiles/publicos

### **Respuesta Esperada**

json  
\[  
  {  
    "usuarioId": 1,  
    "nombreCompleto": "Francisco Enrique Mendez Medina",  
    "fotoPerfil": "https://ejemplo2.com/foto2.jpg",  
    "biografia": "Apasionado del deporte y la actividad física"  
  },  
  {  
    "usuarioId": 2,  
    "nombreCompleto": "Francisco Enrique Mendez Medina 2",  
    "fotoPerfil": "https://ejemplo.com/foto.jpg",  
    "biografia": "Apasionado del deporte y la actividad física"  
  }  
\]  
\`\`\`

\#\#\# Requisitos de UI  
1. ✅ Mostrar lista scrollable (FlatList) de perfiles  
2. ✅ Cada perfil debe mostrar:  
   \- Foto de perfil (Image)  
   \- Nombre completo  
   \- Biografía  
   \- Botón o ícono "Mensaje"  
3. ✅ Guardar internamente el \`usuarioId\` de cada perfil

\#\#\# Comportamiento al presionar botón "Mensaje"  
1. \*\*Abrir Modal de conversación\*\*  
2. \*\*Intentar crear/verificar chat\*\* llamando a la API de chats  
3. \*\*Dentro del modal\*\*, cargar los mensajes si el chat existe  
4. \*\*Al cerrar el modal\*\*, navegar a PANTALLA 2 (Mis Chats)

\---

\#\# 🔄 LÓGICA DE CREACIÓN/VERIFICACIÓN DE CHAT

\#\#\# API Endpoint  
\`\`\`

POST https:*//apimensajeria.onrender.com/api/chats*

### **Caso 1: Verificar si existe chat (sin mensaje inicial)**

**Request:**

json  
{  
  "userId1": 1,  *// ID del usuario actual (desde AsyncStorage)*  
  "userId2": 2   *// ID del perfil seleccionado*

}

**Respuesta \- Chat ya existe:**

json  
{  
  "ok": false,  
  "estatus": 200,  
  "message": "Ya existe un chat con solo esos dos usuarios.",  
  "chat": {  
    "id": 1,  
    "grupoId": null,  
    "estado": true  
  }

}

**Acción:** Usar `chat.id` para cargar los mensajes en el modal.

---

**Respuesta \- Chat NO existe:**

json  
{  
  "ok": false,  
  "estatus": 404,  
  "message": "no has echo un mensjae inicia para crear el chat",  
  "chatId": null

}

**Acción:** Mostrar input para escribir mensaje inicial.

---

### **Caso 2: Crear chat nuevo con mensaje inicial**

**Request:**

json  
{  
  "userId1": 1,     *// Usuario actual*  
  "userId2": 2,     *// Usuario seleccionado*  
  "mensajeInicial": "¡Hola\! ¿Cómo estás?"

}

**Respuesta \- Chat creado:**

json  
{  
  "ok": false,  
  "estatus": 201,  
  "message": "chat creado exitosamente.",  
  "chat": {  
    "id": 12,  
    "participantes": \[  
      {  
        "id": 23,  
        "usuarioId": 1,  
        "activo": true  
      },  
      {  
        "id": 24,  
        "usuarioId": 2,  
        "activo": true  
      }  
    \],  
    "grupoId": null,  
    "estado": true  
  }  
}  
\`\`\`  
\*\*Acción:\*\* Guardar \`chat.id\` y mostrar el mensaje inicial en el modal.

\---

\#\# 🖥️ PANTALLA 2: MIS CHATS

\#\#\# Descripción  
Muestra la lista de conversaciones activas del usuario (como la pantalla principal de WhatsApp).

\#\#\# API Endpoint  
\`\`\`

GET https:*//apimensajeria.onrender.com/api/chats/usuario/{userId}*

**Nota:** `{userId}` es el ID del usuario actual obtenido de AsyncStorage.

### **Respuesta Esperada**

json  
{  
  "ok": true,  
  "estatus": 200,  
  "message": "Chats del usuario obtenidos exitosamente.",  
  "chats": \[  
    {  
      "chatId": 3,  
      "otherParticipant": {  
        "usuarioId": 3  
      }  
    },  
    {  
      "chatId": 5,  
      "otherParticipant": {  
        "usuarioId": 5  
      }  
    }  
  \]  
}  
\`\`\`

\#\#\# Lógica de Procesamiento  
\*\*Para cada chat obtenido:\*\*

1. \*\*Guardar\*\* \`chatId\` asociado al usuario  
2. \*\*Obtener datos del otro participante\*\* con el endpoint:  
\`\`\`

GET https:*//apiautentificacion.onrender.com/api/perfiles/publicos/{usuarioId}*

**Respuesta:**

json  
{  
  "usuarioId": 21,  
  "nombreCompleto": "Francisco Enrique Mendez Medina 3",  
  "fotoPerfil": "https://ejemplo2.com/foto2.jpg",  
  "biografia": "Apasionado del deporte y la actividad física"

}

3. **Crear un objeto combinado** (recomendado para el estado):

javascript  
{  
  chatId: 3,  
  usuarioId: 3,  
  nombreCompleto: "Francisco...",  
  fotoPerfil: "https://...",  
  biografia: "..."

}

### **Requisitos de UI**

1. ✅ Mostrar lista de chats (FlatList)  
2. ✅ Cada item debe mostrar:  
   * Foto del otro usuario  
   * Nombre del otro usuario  
   * (Opcional) Último mensaje  
3. ✅ Al presionar un chat: **Abrir Modal de conversación**

---

## **💬 MODAL: CONVERSACIÓN INDIVIDUAL**

### **Descripción**

Modal que muestra los mensajes del chat seleccionado (similar a la pantalla de chat de WhatsApp).

### **Cuándo se abre este modal**

1. ✅ Desde PANTALLA 1: Al presionar botón "Mensaje" de un perfil  
2. ✅ Desde PANTALLA 2: Al presionar un chat existente

### **Props necesarias para el modal**

javascript  
{  
  chatId: 12,           *// ID del chat*  
  otherUserId: 2,       *// ID del otro usuario*  
  otherUserName: "...", *// Nombre del otro usuario*  
  otherUserPhoto: "..." *// Foto del otro usuario*  
}  
\`\`\`

\---

\#\# 📨 CARGAR MENSAJES DEL CHAT

\#\#\# API Endpoint  
\`\`\`

GET https://apimensajeria.onrender.com/api/chats/{chatId}/messages

### **Respuesta Esperada**

json  
{  
  "messages": \[  
    {  
      "id": 12,  
      "usuarioId": 2,  
      "mensaje": "hola maria"  
    },  
    {  
      "id": 13,  
      "usuarioId": 1,  
      "mensaje": "hola juan"  
    }  
  \],  
  "page": 1,  
  "limit": 50,  
  "hasMore": false  
}  
\`\`\`

\#\#\# Requisitos de UI  
1. ✅ Mostrar mensajes en lista scrollable (FlatList invertida)  
2. ✅ \*\*Mensajes propios\*\* (usuarioId \=== userId actual):  
   \- Alineados a la DERECHA  
   \- Color de fondo diferente (ej: azul)  
3. ✅ \*\*Mensajes del otro usuario\*\*:  
   \- Alineados a la IZQUIERDA  
   \- Color de fondo diferente (ej: gris)  
4. ✅ Scroll automático al último mensaje  
5. ✅ Input de texto en la parte inferior  
6. ✅ Botón de enviar mensaje

\---

\#\# 🌐 WEBSOCKET \- MENSAJERÍA EN TIEMPO REAL

\#\#\# Conexión WebSocket

\*\*URL de conexión:\*\*  
\`\`\`

wss:*//apimensajeria.onrender.com/?userId={userId}*

**Nota:** `{userId}` es el ID del usuario actual.

### **Cuándo conectar**

✅ Al abrir el modal de conversación

### **Cuándo desconectar**

✅ Al cerrar el modal de conversación

### **Biblioteca recomendada**

bash

npm install socket.io-client

### **Código de ejemplo**

javascript  
import io from 'socket.io-client';

const socket \= io('https://apimensajeria.onrender.com', {  
  query: { userId: userIdActual }  
});

*// Conectar*  
socket.connect();

*// Desconectar al cerrar modal*

socket.disconnect();

---

## **📤 ENVIAR MENSAJE (WebSocket)**

### **Evento**

javascript  
socket.emit('sendMessage', {  
  chatId: 12,              *// ID del chat actual*  
  mensaje: "Hola, ¿cómo estás?"

});

### **Estructura de datos**

json  
{  
  "chatId": 12,  
  "mensaje": "Texto del mensaje"

}

---

## **📥 RECIBIR MENSAJES (WebSocket)**

### **Evento a escuchar**

javascript  
socket.on('newMessage', (nuevoMensaje) \=\> {  
  *// nuevoMensaje tiene esta estructura:*  
  {  
    "id": 43,  
    "usuarioId": 2,  
    "mensaje": "Hola\! ¿Cómo estás?"  
  }  
    
  *// Agregar el nuevo mensaje al estado*  
  setMessages(prevMessages \=\> \[...prevMessages, nuevoMensaje\]);

});

### **Requisitos**

1. ✅ Escuchar el evento al montar el modal  
2. ✅ Agregar nuevo mensaje al array de mensajes  
3. ✅ Hacer scroll automático al último mensaje  
4. ✅ Dejar de escuchar al cerrar el modal

---

## **🔄 FLUJO COMPLETO DE USUARIO**

### **ESCENARIO 1: Usuario nuevo inicia conversación**

1. Usuario ve PANTALLA 1 (Perfiles públicos)  
2. Presiona botón "Mensaje" en un perfil  
3. Se abre MODAL de conversación  
4. Sistema verifica si existe chat (POST sin mensajeInicial)  
5. API responde: "no has echo un mensaje inicial" (404)  
6. Se muestra input para escribir primer mensaje  
7. Usuario escribe y envía mensaje  
8. Se crea chat (POST con mensajeInicial)  
9. API devuelve chatId  
10. Se conecta WebSocket  
11. Se muestra el mensaje en el modal  
12. Usuario cierra modal  
13. Se muestra PANTALLA 2 con el nuevo chat

---

### **ESCENARIO 2: Usuario abre conversación existente desde Pantalla 1**

1. Usuario ve PANTALLA 1 (Perfiles públicos)  
2. Presiona botón "Mensaje" en un perfil  
3. Se abre MODAL de conversación  
4. Sistema verifica si existe chat (POST sin mensajeInicial)  
5. API responde: "Ya existe un chat" (200) con chatId  
6. Se cargan mensajes (GET /messages)  
7. Se conecta WebSocket  
8. Usuario puede enviar/recibir mensajes  
9. Usuario cierra modal  
10. Se muestra PANTALLA 2

---

### **ESCENARIO 3: Usuario abre conversación desde Pantalla 2**

1. Usuario ve PANTALLA 2 (Mis Chats)  
2. Presiona un chat de la lista  
3. Se abre MODAL de conversación con el chatId  
4. Se cargan mensajes (GET /messages)  
5. Se conecta WebSocket  
6. Usuario puede enviar/recibir mensajes  
7. Usuario cierra modal  
8. Regresa a PANTALLA 2

---

## **📋 RESUMEN DE ESTADOS NECESARIOS**

### **Estado Global/Context recomendado**

javascript  
{  
  userId: 1,              *// Usuario actual (AsyncStorage)*  
  perfilesPublicos: \[\],   *// Lista de perfiles (Pantalla 1\)*  
  misChats: \[\],           *// Lista de chats con datos completos (Pantalla 2\)*  
  modalVisible: false,    *// Control del modal*  
  chatActual: {  
    chatId: null,  
    otherUserId: null,  
    otherUserName: null,  
    otherUserPhoto: null,  
    messages: \[\]  
  }  
}  
\`\`\`

\---

\#\# ⚠️ CONSIDERACIONES IMPORTANTES

\#\#\# Manejo de Errores  
1\. ✅ Validar que userId existe en AsyncStorage  
2\. ✅ Manejar errores de red (try/catch)  
3\. ✅ Mostrar loading mientras cargan datos  
4\. ✅ Mostrar mensaje si no hay perfiles o chats

\#\#\# Performance  
1\. ✅ Usar FlatList para listas largas  
2\. ✅ Implementar paginación si hay muchos mensajes (hasMore: true)  
3\. ✅ Desconectar WebSocket al salir del modal

\#\#\# UX  
1\. ✅ Mostrar indicador de "escribiendo..." (opcional)  
2\. ✅ Mostrar hora de los mensajes (opcional)  
3\. ✅ Vibración o sonido al recibir mensaje (opcional)  
4\. ✅ Badge con cantidad de mensajes no leídos (opcional)

\---

\#\# 🎨 COMPONENTES SUGERIDOS  
\`\`\`  
App  
├── Pantalla1\_PerfilesPublicos  
│   ├── FlatList  
│   └── ItemPerfil (con botón Mensaje)  
│  
├── Pantalla2\_MisChats  
│   ├── FlatList  
│   └── ItemChat  
│  
└── ModalConversacion  
    ├── Header (foto y nombre del otro usuario)  
    ├── FlatList de mensajes  
    │   ├── MensajePropio  
    │   └── MensajeOtro

    └── InputEnviarMensaje

---

## **🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO**

1. ✅ Obtener userId de AsyncStorage  
2. ✅ Pantalla 1: Cargar y mostrar perfiles públicos  
3. ✅ Modal: Estructura básica y lógica de creación de chat  
4. ✅ Modal: Cargar y mostrar mensajes  
5. ✅ Pantalla 2: Cargar y mostrar mis chats  
6. ✅ WebSocket: Conectar y escuchar mensajes  
7. ✅ WebSocket: Enviar mensajes  
8. ✅ Navegación entre pantallas y modales  
9. ✅ Estilos y UX final

