import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendario-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioCitasComponent implements OnInit {
  vistaActual: 'dia' | 'semana' | 'mes' = 'semana';
  fechaActual: Date = new Date();
  diasMesNombres: string[] = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  horasDia: string[] = [];
  citas: any[] = [];
  citasPorDia: any = {};
  semanasDelMes: any[] = [];
  
  // Variables precalculadas
  fechasSemana: Date[] = [];
  citasCache: Map<string, any[]> = new Map();
  tituloCalendario: string = '';

  // Modal de nueva cita
  mostrarModalCita: boolean = false;
  nuevaCita: any = { fecha: '', hora: '', paciente_id: null, tratamiento_id: null, odontologo_id: null };
  pacientes: any[] = [];
  tratamientos: any[] = [];
  odontologos: any[] = [];
  guardando: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    for (let h = 8; h <= 20; h++) {
      this.horasDia.push(`${h.toString().padStart(2, '0')}:00`);
    }
  }

  ngOnInit() {
    this.actualizarVista();
    this.cargarDatosCita();
  }

  cargarDatosCita() {
    this.http.get(`${environment.apiUrl}/pacientes`).subscribe({
      next: (data: any) => {
        this.pacientes = Array.isArray(data) ? data : (data.pacientes || []);
      }
    });
    this.http.get(`${environment.apiUrl}/tratamientos`).subscribe({
      next: (data: any) => this.tratamientos = Array.isArray(data) ? data : []
    });
    this.http.get(`${environment.apiUrl}/auth/odontologos`).subscribe({
      next: (data: any) => this.odontologos = Array.isArray(data) ? data : []
    });
  }

  actualizarVista() {
    this.precalcularFechas();
    this.cargarCitas();
  }

  precalcularFechas() {
    if (this.vistaActual === 'semana') {
      this.fechasSemana = this.calcularFechasSemana();
      this.tituloCalendario = `Semana del ${this.formatearFecha(this.fechasSemana[0])}`;
    } else if (this.vistaActual === 'dia') {
      this.tituloCalendario = this.formatearFecha(this.fechaActual);
    } else {
      this.tituloCalendario = this.formatearMes(this.fechaActual);
      this.generarSemanasDelMes();
    }
  }

  calcularFechasSemana(): Date[] {
    const fechas: Date[] = [];
    const inicio = this.getInicioSemana();
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(fecha.getDate() + i);
      fechas.push(fecha);
    }
    return fechas;
  }

  cargarCitas() {
    let params: any = {};
    let desde: Date, hasta: Date;

    if (this.vistaActual === 'dia') {
      desde = new Date(this.fechaActual);
      hasta = new Date(this.fechaActual);
    } else if (this.vistaActual === 'semana') {
      desde = this.fechasSemana[0];
      hasta = this.fechasSemana[this.fechasSemana.length - 1];
    } else {
      desde = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1);
      hasta = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0);
    }

    params.desde = desde.toISOString().split('T')[0];
    params.hasta = hasta.toISOString().split('T')[0];

    this.http.get(`${environment.apiUrl}/citas`, { params }).subscribe({
      next: (data: any) => {
        this.citas = data;
        this.organizarCitas();
      },
      error: () => {
        this.citas = [];
        this.organizarCitas();
      }
    });
  }

  organizarCitas() {
    this.citasPorDia = {};
    this.citasCache = new Map();
    
    if (this.citas) {
      this.citas.forEach(cita => {
        if (!this.citasPorDia[cita.fecha]) {
          this.citasPorDia[cita.fecha] = [];
        }
        this.citasPorDia[cita.fecha].push(cita);
      });
      
      if (this.vistaActual === 'semana') {
        this.fechasSemana.forEach(fecha => {
          const fechaStr = fecha.toISOString().split('T')[0];
          const citasDia = this.citasPorDia[fechaStr] || [];
          
          this.horasDia.forEach(hora => {
            const key = `${fechaStr}_${hora}`;
            this.citasCache.set(key, citasDia.filter((c: any) => c.hora?.startsWith(hora)));
          });
        });
      }
    }
    
    if (this.vistaActual === 'mes') {
      this.generarSemanasDelMes();
    }
  }

  getInicioSemana(): Date {
    const fecha = new Date(this.fechaActual);
    const dia = fecha.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    fecha.setDate(fecha.getDate() + diff);
    return fecha;
  }

  cambiarVista(vista: 'dia' | 'semana' | 'mes') {
    this.vistaActual = vista;
    this.actualizarVista();
  }

  cambiarFecha(direccion: number) {
    const nueva = new Date(this.fechaActual);
    if (this.vistaActual === 'dia') nueva.setDate(nueva.getDate() + direccion);
    else if (this.vistaActual === 'semana') nueva.setDate(nueva.getDate() + (7 * direccion));
    else nueva.setMonth(nueva.getMonth() + direccion);
    this.fechaActual = nueva;
    this.actualizarVista();
  }

  irHoy() {
    this.fechaActual = new Date();
    this.actualizarVista();
  }

  getCitasParaHoraCache(fecha: Date, hora: string): any[] {
    if (this.vistaActual === 'dia') {
      const fechaStr = fecha.toISOString().split('T')[0];
      const citasDia = this.citasPorDia[fechaStr] || [];
      return citasDia.filter((c: any) => c.hora?.startsWith(hora));
    }
    const fechaStr = fecha.toISOString().split('T')[0];
    const key = `${fechaStr}_${hora}`;
    return this.citasCache.get(key) || [];
  }

// Método helper para obtener fecha en formato YYYY-MM-DD local
private formatFechaLocal(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}





  // ===== MODAL DE NUEVA CITA =====
    abrirModalCita(fecha: Date, hora?: string) {
      this.nuevaCita = {
        fecha: this.formatFechaLocal(fecha),  // ← Usar formato local
        hora: hora || '',
        paciente_id: null,
        tratamiento_id: null,
        odontologo_id: null
      };
      this.mostrarModalCita = true;
    }

  cerrarModal() {
    this.mostrarModalCita = false;
  }

  guardarCitaDesdeCalendario() {
    if (!this.nuevaCita.paciente_id || !this.nuevaCita.tratamiento_id || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
      Swal.fire('⚠️ Error', 'Completa los campos requeridos: Paciente, Tratamiento, Fecha y Hora', 'error');
      return;
    }

    this.guardando = true;

    this.http.post(`${environment.apiUrl}/citas`, {
      paciente_id: this.nuevaCita.paciente_id,
      tratamiento_id: this.nuevaCita.tratamiento_id,
      odontologo_id: this.nuevaCita.odontologo_id || null,
      fecha: this.nuevaCita.fecha,
      hora: this.nuevaCita.hora
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarModalCita = false;
        Swal.fire({
          icon: 'success',
          title: '✅ Cita creada',
          text: 'La cita se ha agendado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.cargarCitas();
      },
      error: (err) => {
        this.guardando = false;
        Swal.fire('❌ Error', err.error?.error || 'No se pudo crear la cita', 'error');
      }
    });
  }

  // ===== UTILIDADES =====
  mismaFecha(f1: Date, f2: Date): boolean {
    return f1.getFullYear() === f2.getFullYear() &&
           f1.getMonth() === f2.getMonth() &&
           f1.getDate() === f2.getDate();
  }

  generarSemanasDelMes() {
    const year = this.fechaActual.getFullYear();
    const month = this.fechaActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    
    let diaActual = new Date(primerDia);
    diaActual.setDate(diaActual.getDate() - diaActual.getDay());
    
    this.semanasDelMes = [];
    
    while (diaActual <= ultimoDia || this.semanasDelMes.length < 6) {
      const semana = [];
      for (let i = 0; i < 7; i++) {
        const fechaStr = diaActual.toISOString().split('T')[0];
        semana.push({
          fecha: new Date(diaActual),
          dia: diaActual.getDate(),
          esMesActual: diaActual.getMonth() === month,
          esHoy: this.mismaFecha(diaActual, new Date()),
          citasCount: (this.citasPorDia[fechaStr] || []).length
        });
        diaActual.setDate(diaActual.getDate() + 1);
      }
      this.semanasDelMes.push(semana);
      if (diaActual > ultimoDia && this.semanasDelMes.length >= 4) break;
    }
  }

  getEstadoColor(estado: string): string {
    const colores: any = {
      'pendiente': '#f59e0b',
      'confirmada': '#10b981',
      'cancelada': '#ef4444',
      'completada': '#6b7280'
    };
    return colores[estado] || '#6b7280';
  }

  getDiaSemana(fecha: Date): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return dias[fecha.getDay()];
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  }

  formatearMes(fecha: Date): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }
}