import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agenda-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './agenda-citas.component.html',
  styleUrls: ['./agenda-citas.component.css']
})
export class AgendaCitasComponent implements OnInit {
  vistaActual: 'dia' | 'semana' | 'mes' = 'semana';
  fechaActual: Date = new Date();
  horasDia: string[] = [];
  fechasSemana: Date[] = [];
  citas: any[] = [];
  citasPorDia: any = {};
  tituloCalendario: string = '';

  // Filtros
  estadoFiltro: string = 'todos';

  // Modal nueva cita
  mostrarModalNueva: boolean = false;
  nuevaCita: any = { fecha: '', hora: '', paciente_id: null, tratamiento_id: null, odontologo_id: null };

  // Modal detalle cita
  mostrarModalDetalle: boolean = false;
  citaSeleccionada: any = null;
  mostrarSelectorEstado: boolean = false;

  // Listas para selects
  pacientes: any[] = [];
  tratamientos: any[] = [];
  odontologos: any[] = [];

  // Vista Mes
  semanasDelMes: any[] = [];
  diasMesNombres: string[] = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
metodoPagoSeleccionado: string = 'efectivo';
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    for (let h = 7; h <= 20; h++) {
      this.horasDia.push(`${h.toString().padStart(2, '0')}:00`);
    }
  }

  ngOnInit() {
    this.actualizarVista();
    this.cargarDatos();
  }

  cargarDatos() {
    this.http.get(`${environment.apiUrl}/pacientes`).subscribe({
      next: (data: any) => this.pacientes = Array.isArray(data) ? data : (data.pacientes || [])
    });
    this.http.get(`${environment.apiUrl}/tratamientos`).subscribe({
      next: (data: any) => this.tratamientos = Array.isArray(data) ? data : []
    });
    this.http.get(`${environment.apiUrl}/auth/odontologos`).subscribe({
      next: (data: any) => this.odontologos = Array.isArray(data) ? data : []
    });
  }

  // ===== ACTUALIZAR VISTA =====
  actualizarVista() {
    if (this.vistaActual === 'mes') {
      this.generarSemanasDelMes();
      return;
    }
    this.calcularFechasSemana();
    this.cargarCitas();
  }

  calcularFechasSemana() {
    const inicio = this.getInicioSemana();
    this.fechasSemana = [];
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(fecha.getDate() + i);
      this.fechasSemana.push(fecha);
    }
    this.tituloCalendario = `${this.formatFecha(this.fechasSemana[0])} - ${this.formatFechaCorta(this.fechasSemana[5])}`;
  }

  getInicioSemana(): Date {
    const fecha = new Date(this.fechaActual);
    const dia = fecha.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    fecha.setDate(fecha.getDate() + diff);
    return fecha;
  }

  cargarCitas() {
    let desde: Date, hasta: Date;
    
    if (this.vistaActual === 'semana') {
      desde = this.fechasSemana[0];
      hasta = this.fechasSemana[5];
    } else if (this.vistaActual === 'dia') {
      desde = new Date(this.fechaActual);
      hasta = new Date(this.fechaActual);
    } else {
      desde = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1);
      hasta = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0);
    }

    this.http.get(`${environment.apiUrl}/citas`, {
      params: {
        desde: this.formatFechaLocal(desde),
        hasta: this.formatFechaLocal(hasta)
      }
    }).subscribe({
      next: (data: any) => {
        this.citas = data;
        this.organizarCitas();
      },
      error: () => { this.citas = []; this.organizarCitas(); }
    });
  }

  organizarCitas() {
    this.citasPorDia = {};
    this.citas.forEach(cita => {
      if (!this.citasPorDia[cita.fecha]) {
        this.citasPorDia[cita.fecha] = [];
      }
      this.citasPorDia[cita.fecha].push(cita);
    });
  }

  // ===== NAVEGACIÓN =====
  cambiarSemana(direccion: number) {
    this.fechaActual.setDate(this.fechaActual.getDate() + (7 * direccion));
    this.actualizarVista();
  }

  irHoy() {
    this.fechaActual = new Date();
    this.actualizarVista();
  }

  cambiarVista(vista: 'dia' | 'semana' | 'mes') {
    this.vistaActual = vista;
    this.actualizarVista();
  }

  cambiarMes(direccion: number) {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + direccion);
    this.generarSemanasDelMes();
  }

  // ===== VISTA MES =====
  generarSemanasDelMes() {
    const year = this.fechaActual.getFullYear();
    const month = this.fechaActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const desde = new Date(year, month, 1);
    const hasta = new Date(year, month + 1, 0);

    this.tituloCalendario = this.formatearMes(this.fechaActual);

    this.http.get(`${environment.apiUrl}/citas`, {
      params: {
        desde: this.formatFechaLocal(desde),
        hasta: this.formatFechaLocal(hasta)
      }
    }).subscribe({
      next: (data: any) => {
        this.citas = data;
        this.organizarCitas();
        this.construirSemanasMes(primerDia, ultimoDia, month);
      }
    });
  }

  construirSemanasMes(primerDia: Date, ultimoDia: Date, month: number) {
    let diaActual = new Date(primerDia);
    diaActual.setDate(diaActual.getDate() - diaActual.getDay());
    
    this.semanasDelMes = [];
    
    while (diaActual <= ultimoDia || this.semanasDelMes.length < 6) {
      const semana = [];
      for (let i = 0; i < 7; i++) {
        const fechaStr = this.formatFechaLocal(diaActual);
        semana.push({
          fecha: new Date(diaActual),
          dia: diaActual.getDate(),
          esMesActual: diaActual.getMonth() === month,
          esHoy: this.esHoy(diaActual),
          citasCount: (this.citasPorDia[fechaStr] || []).length
        });
        diaActual.setDate(diaActual.getDate() + 1);
      }
      this.semanasDelMes.push(semana);
      if (diaActual > ultimoDia && this.semanasDelMes.length >= 4) break;
    }
  }

  formatearMes(fecha: Date): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  // ===== MODAL NUEVA CITA =====
  abrirModalNueva(fecha: Date, hora: string) {
    this.nuevaCita = {
      fecha: this.formatFechaLocal(fecha),
      hora: hora,
      paciente_id: null,
      tratamiento_id: null,
      odontologo_id: null
    };
    this.mostrarModalNueva = true;
  }

  abrirModalDesdeMes(fecha: Date) {
    this.abrirModalNueva(fecha, '');
  }

  guardarNuevaCita() {
    if (!this.nuevaCita.paciente_id || !this.nuevaCita.tratamiento_id || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
      Swal.fire('⚠️ Error', 'Completa todos los campos requeridos', 'error');
      return;
    }

    this.http.post(`${environment.apiUrl}/citas`, {
      paciente_id: this.nuevaCita.paciente_id,
      tratamiento_id: this.nuevaCita.tratamiento_id,
      odontologo_id: this.nuevaCita.odontologo_id || null,
      fecha: this.nuevaCita.fecha,
      hora: this.nuevaCita.hora
    }).subscribe({
      next: () => {
        this.mostrarModalNueva = false;
        Swal.fire({ icon: 'success', title: '✅ Cita creada', timer: 1500, showConfirmButton: false });
        this.actualizarVista();
      },
      error: (err) => Swal.fire('❌ Error', err.error?.error || 'No se pudo crear', 'error')
    });
  }

  // ===== MODAL DETALLE CITA =====
  abrirDetalleCita(cita: any, event: Event) {
    event.stopPropagation();
    this.citaSeleccionada = { ...cita };
    this.mostrarSelectorEstado = false;
    this.mostrarModalDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarModalDetalle = false;
    this.citaSeleccionada = null;
  }
// Modificar cambiarEstadoCita para que envíe el método de pago
cambiarEstadoCita(estado: string) {
  if (!this.citaSeleccionada) return;

  const body: any = { estado };
  
  // Si va a completar la cita, incluir método de pago
  if (estado === 'completada') {
    body.metodo_pago = this.metodoPagoSeleccionado;
  }

  this.http.patch(`${environment.apiUrl}/citas/${this.citaSeleccionada.id}/estado`, body).subscribe({
    next: () => {
      this.mostrarModalDetalle = false;
      this.metodoPagoSeleccionado = 'efectivo'; // Resetear
      this.actualizarVista();
    },
    error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
  });
}


  eliminarCita() {
    Swal.fire({
      title: '¿Eliminar cita?',
      text: `¿Estás seguro de eliminar la cita de ${this.citaSeleccionada.paciente?.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cambiarEstadoCita('cancelada');
      }
    });
  }

  enviarWhatsApp() {
    if (!this.citaSeleccionada) return;
    const telefono = this.citaSeleccionada.paciente?.telefono?.replace(/\D/g, '') || '';
    const mensaje = `Hola ${this.citaSeleccionada.paciente?.nombre}, te recordamos tu cita dental para el día ${this.citaSeleccionada.fecha} a las ${this.citaSeleccionada.hora?.substring(0, 5)}. ¡Te esperamos!`;
    
    if (telefono) {
      window.open(`https://wa.me/51${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }
    this.cerrarDetalle();
  }

  verPaciente() {
    if (this.citaSeleccionada?.paciente?.id) {
      this.router.navigate(['/pacientes', this.citaSeleccionada.paciente.id]);
      this.cerrarDetalle();
    }
  }

  // ===== RECORDATORIOS MASIVOS =====
  enviarRecordatoriosMasivos() {
    Swal.fire({
      title: '📱 Enviar recordatorios masivos',
      text: '¿Enviar recordatorios a todos los pacientes con cita pendiente?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${environment.apiUrl}/whatsapp/recordatorios-masivos`, {}).subscribe({
          next: (res: any) => {
            Swal.fire('✅ Completado', `Se enviaron ${res.enviados} de ${res.total} recordatorios`, 'success');
          },
          error: () => Swal.fire('❌ Error', 'No se pudieron enviar', 'error')
        });
      }
    });
  }

  // ===== UTILIDADES =====
  formatFechaLocal(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  formatFecha(fecha: Date): string {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  }

  formatFechaCorta(fecha: Date): string {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  getDiaSemana(fecha: Date): string {
    return ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][fecha.getDay()];
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getFullYear() === hoy.getFullYear() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getDate() === hoy.getDate();
  }

  getCitasParaCelda(fecha: Date, hora: string): any[] {
    const fechaStr = this.formatFechaLocal(fecha);
    const citasDia = this.citasPorDia[fechaStr] || [];
    
    // La celda cubre desde hora:00 hasta hora:59
    const horaNum = parseInt(hora.split(':')[0]);
    const horaFin = `${String(horaNum).padStart(2, '0')}:59`;
    
    let filtradas = citasDia.filter((c: any) => {
      const citaHora = c.hora?.substring(0, 5);
      if (!citaHora) return false;
      return citaHora >= hora && citaHora <= horaFin;
    });
    
    if (this.estadoFiltro !== 'todos') {
      filtradas = filtradas.filter((c: any) => c.estado === this.estadoFiltro);
    }
    
    return filtradas;
  }

  getEstadoColor(estado: string): string {
    const colores: any = {
      'pendiente': '#f59e0b',
      'confirmada': '#3b82f6',
      'cancelada': '#ef4444',
      'completada': '#10b981'
    };
    return colores[estado] || '#6b7280';
  }

  getEstadoIcono(estado: string): string {
    const iconos: any = {
      'pendiente': '⏳',
      'confirmada': '✅',
      'cancelada': '❌',
      'completada': '✔️'
    };
    return iconos[estado] || '📋';
  }

  contarCitasPorEstado(estado: string): number {
    if (estado === 'todos') return this.citas.length;
    return this.citas.filter(c => c.estado === estado).length;
  }
}