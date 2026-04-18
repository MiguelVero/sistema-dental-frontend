import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl);
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

  disconnect() {
    this.socket.disconnect();
  }
}