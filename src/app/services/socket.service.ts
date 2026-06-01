import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    // Conectar al backend (sin /api)
    const backendUrl = environment.apiUrl.replace('/api', '');
    this.socket = io(backendUrl, {
      transports: ['websocket', 'polling']
    });
  }

  onRecordatoriosEnviados(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('recordatorios_enviados', (data) => observer.next(data));
    });
  }

  onCitaActualizada(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('cita_actualizada', (data) => observer.next(data));
    });
  }

  // Escuchar notificaciones en tiempo real
  onNuevaNotificacion(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('nueva_notificacion', (data) => {
        console.log('🔔 Nueva notificación recibida:', data);
        observer.next(data);
      });
    });
  }

// Escuchar eliminación de notificaciones
onEliminarNotificacion(): Observable<any> {
  return new Observable(observer => {
    this.socket.on('eliminar_notificacion', (data) => {
      console.log('🗑️ Notificación eliminada:', data);
      observer.next(data);
    });
  });
}

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }


}