import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cita {
  id: number;
  paciente_id: number;
  tratamiento_id: number;
  fecha: string;
  hora: string;
  estado: string;
  recordatorio_24h_enviado: boolean;
  recordatorio_1h_enviado: boolean;
  confirmada_cliente: boolean;
  notas?: string;
  paciente?: any;
  tratamiento?: any;
}

@Injectable({ providedIn: 'root' })
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  getCitasHoy(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/hoy`);
  }

  crearCita(cita: Partial<Cita>): Observable<any> {
    return this.http.post(this.apiUrl, cita);
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado });
  }
}