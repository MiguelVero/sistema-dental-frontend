import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CitaService, Cita } from '../../services/cita.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']  // ← Agregar esta línea
})
export class CitasComponent implements OnInit, OnDestroy {
  citas: Cita[] = [];
  filtro: string = 'hoy';
  private subscriptions: Subscription[] = [];

  get citasFiltradas(): Cita[] {
    if (this.filtro === 'hoy') {
      const hoy = new Date().toISOString().split('T')[0];
      return this.citas.filter(c => c.fecha === hoy);
    }
    if (this.filtro === 'pendientes') {
      return this.citas.filter(c => c.estado === 'pendiente');
    }
    return this.citas;
  }

  constructor(
    private citaService: CitaService,
    private whatsappService: WhatsAppService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.cargarCitas();

    // Escuchar actualizaciones en tiempo real
    this.subscriptions.push(
      this.socketService.onCitaActualizada().subscribe(() => {
        this.cargarCitas();
      })
    );
  }

  cargarCitas() {
    this.citaService.getCitas().subscribe({
      next: (data) => this.citas = data,
      error: (err) => console.error('Error cargando citas:', err)
    });
  }

  enviarRecordatorio(cita: Cita) {
    this.whatsappService.mostrarModalEnvio(cita);
  }

  enviarRecordatoriosMasivos() {
    Swal.fire({
      title: 'Enviar recordatorios masivos',
      text: '¿Enviar recordatorios a todos los pacientes con cita pendiente?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.whatsappService.enviarRecordatoriosMasivos().subscribe({
          next: (res) => {
            Swal.fire('Completado', `Se enviaron ${res.enviados} de ${res.total} recordatorios`, 'success');
            this.cargarCitas();
          },
          error: () => Swal.fire('Error', 'No se pudieron enviar los recordatorios', 'error')
        });
      }
    });
  }

  cambiarEstado(cita: Cita, nuevoEstado: string) {
    this.citaService.actualizarEstado(cita.id, nuevoEstado).subscribe({
      next: () => this.cargarCitas(),
      error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    });
  }

  getEstadoClass(estado: string): string {
    const clases: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
      'completada': 'bg-gray-100 text-gray-800'
    };
    return clases[estado] || 'bg-gray-100';
  }

  getEstadoText(estado: string): string {
    const textos: Record<string, string> = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'completada': 'Completada'
    };
    return textos[estado] || estado;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}