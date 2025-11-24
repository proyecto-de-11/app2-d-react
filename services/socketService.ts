import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'https://apimensajeria.onrender.com';

  // Conectar al servidor WebSocket
  connect(userId: number): void {
    if (this.socket?.connected) {
      console.log('Socket ya está conectado');
      return;
    }

    this.socket = io(this.serverUrl, {
      query: { userId: userId.toString() },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión:', error);
    });
  }

  // Desconectar del servidor
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket desconectado manualmente');
    }
  }

  // Enviar mensaje
  sendMessage(chatId: number, mensaje: string): void {
    if (!this.socket?.connected) {
      console.error('Socket no está conectado');
      return;
    }

    this.socket.emit('sendMessage', {
      chatId,
      mensaje,
    });

    console.log('Mensaje enviado:', { chatId, mensaje });
  }

  // Escuchar nuevos mensajes
  onNewMessage(callback: (mensaje: any) => void): void {
    if (!this.socket) {
      console.error('Socket no está inicializado');
      return;
    }

    this.socket.on('newMessage', callback);
  }

  // Remover listener de nuevos mensajes
  offNewMessage(): void {
    if (this.socket) {
      this.socket.off('newMessage');
    }
  }

  // Enviar evento de "escribiendo"
  sendTyping(chatId: number, isTyping: boolean): void {
    if (!this.socket?.connected) {
      console.error('Socket no está conectado');
      return;
    }

    console.log('📤 Emitiendo evento typing:', { chatId, isTyping });
    this.socket.emit('typing', {
      chatId,
      isTyping,
    });
  }

  // Escuchar evento de "escribiendo"
  onUserTyping(callback: (data: { chatId: number; isTyping: boolean }) => void): void {
    if (!this.socket) {
      console.error('Socket no está inicializado');
      return;
    }

    console.log('🎧 Registrando listener para evento userTyping');
    this.socket.on('userTyping', (data) => {
      console.log('🔔 Socket recibió evento userTyping:', data);
      callback(data);
    });
  }

  // Remover listener de "escribiendo"
  offUserTyping(): void {
    if (this.socket) {
      this.socket.off('userTyping');
    }
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Exportar instancia única (Singleton)
export const socketService = new SocketService();
