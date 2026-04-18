import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private apiUrl = `${environment.apiUrl}/whatsapp`;

  constructor(private http: HttpClient) {}

  enviarRecordatorioManual(citaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/recordatorio/${citaId}`, {});
  }

  enviarRecordatoriosMasivos(fecha?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recordatorios-masivos`, { fecha });
  }

  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`);
  }

  async mostrarModalEnvio(cita: any): Promise<void> {
    const result = await Swal.fire({
      title: 'Enviar recordatorio',
      html: `
        <div class="text-left">
          <p><strong>Paciente:</strong> ${cita.paciente?.nombre}</p>
          <p><strong>Teléfono:</strong> ${cita.paciente?.telefono}</p>
          <p><strong>Cita:</strong> ${cita.fecha} a las ${cita.hora}</p>
          <hr>
          <textarea id="mensaje" class="swal2-textarea" rows="4">Hola ${cita.paciente?.nombre}, te recordamos tu cita dental para el día ${cita.fecha} a las ${cita.hora}. Por favor confirma tu asistencia.</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '📤 Enviar por WhatsApp',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const mensaje = (document.getElementById('mensaje') as HTMLTextAreaElement).value;
        if (!mensaje) {
          Swal.showValidationMessage('El mensaje no puede estar vacío');
        }
        return mensaje;
      }
    });

    if (result.isConfirmed) {
      // Enviar automático por API
      this.enviarRecordatorioManual(cita.id).subscribe({
        next: () => {
          Swal.fire('Enviado', 'Recordatorio enviado exitosamente', 'success');
        },
        error: () => {
          // Fallback: abrir WhatsApp Web manualmente
          const telefono = cita.paciente.telefono.replace(/\D/g, '');
          const url = `https://wa.me/51${telefono}?text=${encodeURIComponent(result.value)}`;
          window.open(url, '_blank');
          Swal.fire('Abrir WhatsApp', 'No se pudo enviar automáticamente. Se abrirá WhatsApp Web para que envíes manualmente.', 'info');
        }
      });
    }
  }
}