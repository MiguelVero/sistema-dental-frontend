import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './paciente-detalle.component.html',
  styleUrls: ['./paciente-detalle.component.css']
})
export class PacienteDetalleComponent implements OnInit {
  paciente: any = null;
  historialMedico: any[] = [];
  odontograma: any[] = [];
  citas: any[] = [];
  // Nueva propiedad para el modo de selección
modoSeleccion: string | null = null; // null = sin modo, 'caries', 'obturado', etc.
  tabActivo: 'info' | 'historial' | 'odontograma' | 'citas' = 'info';
  
  // Estado de edición
  editando = false;
  pacienteEdit: any = {};

  // Odontograma interactivo
  dientesSuperiores: number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  dientesInferiores: number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
  dienteSeleccionado: any = null;
  
  // Estados del odontograma
  estadosDiente = [
    { valor: 'sano', label: 'Sano', color: '#10b981', icono: '🦷' },
    { valor: 'caries', label: 'Caries', color: '#ef4444', icono: '🔴' },
    { valor: 'obturado', label: 'Obturado', color: '#f59e0b', icono: '🟡' },
    { valor: 'ausente', label: 'Ausente', color: '#6b7280', icono: '❌' },
    { valor: 'corona', label: 'Corona', color: '#8b5cf6', icono: '👑' },
    { valor: 'puente', label: 'Puente', color: '#3b82f6', icono: '🌉' },
    { valor: 'endodoncia', label: 'Endodoncia', color: '#ec4899', icono: '🩺' },
    { valor: 'implante', label: 'Implante', color: '#06b6d4', icono: '🔩' },
    { valor: 'sellante', label: 'Sellante', color: '#84cc16', icono: '🛡️' }
  ];

  carasDiente = ['oclusal', 'mesial', 'distal', 'vestibular', 'lingual'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPaciente(id);
      this.cargarOdontograma(id);
    }
  }

  cargarPaciente(id: string) {
    this.http.get(`${environment.apiUrl}/pacientes/${id}`).subscribe({
      next: (data: any) => {
        this.paciente = data;
        this.historialMedico = data.historial_medico || [];
        this.citas = data.citas || [];
        this.pacienteEdit = { ...data };
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la información del paciente', 'error');
      }
    });
  }

  cargarOdontograma(id: string) {
    this.http.get(`${environment.apiUrl}/pacientes/${id}/odontograma`).subscribe({
      next: (data: any) => {
        this.odontograma = data;
      },
      error: () => {
        this.odontograma = [];
      }
    });
  }

  // Cambiar tabs
  cambiarTab(tab: 'info' | 'historial' | 'odontograma' | 'citas') {
    this.tabActivo = tab;
  }

  // Editar información
  toggleEdicion() {
    this.editando = !this.editando;
    if (!this.editando) {
      this.pacienteEdit = { ...this.paciente };
    }
  }

  guardarEdicion() {
    this.http.put(`${environment.apiUrl}/pacientes/${this.paciente.id}`, this.pacienteEdit).subscribe({
      next: (data: any) => {
        this.paciente = data;
        this.editando = false;
        Swal.fire('Éxito', 'Información actualizada correctamente', 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'Error al actualizar', 'error');
      }
    });
  }

  // Historial médico
  agregarHistorialMedico() {
    Swal.fire({
      title: 'Agregar al Historial Médico',
      html: `
        <div class="text-left">
          <select id="tipo" class="swal2-select" style="width:100%; padding:0.5rem; margin-bottom:1rem;">
            <option value="">Seleccionar tipo</option>
            <option value="alergia">Alergia</option>
            <option value="enfermedad">Enfermedad</option>
            <option value="medicamento">Medicamento</option>
            <option value="cirugia">Cirugía</option>
            <option value="habito">Hábito</option>
            <option value="otro">Otro</option>
          </select>
          <textarea id="descripcion" class="swal2-textarea" placeholder="Descripción" style="height:100px;"></textarea>
          <select id="estado" class="swal2-select" style="width:100%; padding:0.5rem; margin-top:1rem;">
            <option value="activo">Activo</option>
            <option value="curado">Curado</option>
            <option value="control">En control</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const tipo = (document.getElementById('tipo') as HTMLSelectElement)?.value;
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement)?.value;
        const estado = (document.getElementById('estado') as HTMLSelectElement)?.value;
        
        if (!tipo || !descripcion) {
          Swal.showValidationMessage('Tipo y descripción son requeridos');
          return false;
        }
        
        return { tipo, descripcion, estado };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarHistorialMedico(result.value);
      }
    });
  }

  guardarHistorialMedico(data: any) {
    this.http.post(`${environment.apiUrl}/pacientes/${this.paciente.id}/historial-medico`, data).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Registro agregado correctamente', 'success');
        this.cargarPaciente(this.paciente.id.toString());
      },
      error: () => Swal.fire('Error', 'No se pudo agregar el registro', 'error')
    });
  }

  eliminarHistorialMedico(id: number) {
    Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/pacientes/historial-medico/${id}`).subscribe({
          next: () => {
            this.cargarPaciente(this.paciente.id.toString());
            Swal.fire('Eliminado', 'Registro eliminado', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  // Cambiar el método de selección
seleccionarEstadoModo(estado: string) {
  this.modoSeleccion = this.modoSeleccion === estado ? null : estado;
}

 // Modificar seleccionarDiente
seleccionarDiente(diente: number) {
  if (this.modoSeleccion) {
    // Modo rápido: aplicar estado directamente
    this.aplicarEstadoDiente(diente, this.modoSeleccion);
  } else {
    // Modo normal: abrir modal
    const dienteData = this.odontograma.find(o => o.diente === diente.toString());
    this.dienteSeleccionado = {
      numero: diente,
      estado: dienteData?.estado || 'sano',
      cara: dienteData?.cara || '',
      notas: dienteData?.notas || ''
    };
  }
}

aplicarEstadoDiente(diente: number, estado: string) {
  const index = this.odontograma.findIndex(o => o.diente === diente.toString());
  if (index >= 0) {
    this.odontograma[index].estado = estado;
  } else {
    this.odontograma.push({
      diente: diente.toString(),
      estado: estado,
      cara: null,
      notas: null
    });
  }
  // Actualizar para reflejar cambios visuales
  this.odontograma = [...this.odontograma];
}

  actualizarDiente() {
    if (!this.dienteSeleccionado) return;

    const dienteIndex = this.odontograma.findIndex(
      o => o.diente === this.dienteSeleccionado.numero.toString()
    );

    if (dienteIndex >= 0) {
      this.odontograma[dienteIndex] = {
        ...this.odontograma[dienteIndex],
        estado: this.dienteSeleccionado.estado,
        cara: this.dienteSeleccionado.cara,
        notas: this.dienteSeleccionado.notas
      };
    } else {
      this.odontograma.push({
        diente: this.dienteSeleccionado.numero.toString(),
        estado: this.dienteSeleccionado.estado,
        cara: this.dienteSeleccionado.cara,
        notas: this.dienteSeleccionado.notas
      });
    }
  }

  guardarOdontograma() {
    const dientes = this.odontograma.map(o => ({
      diente: o.diente,
      cara: o.cara || null,
      estado: o.estado,
      notas: o.notas || null
    }));

    this.http.post(`${environment.apiUrl}/pacientes/${this.paciente.id}/odontograma`, { dientes }).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Odontograma guardado correctamente', 'success');
      },
      error: () => Swal.fire('Error', 'No se pudo guardar el odontograma', 'error')
    });
  }

  getEstadoDiente(diente: number): any {
    const dienteData = this.odontograma.find(o => o.diente === diente.toString());
    if (!dienteData || dienteData.estado === 'sano') return null;
    return this.estadosDiente.find(e => e.valor === dienteData.estado);
  }

  getColorDiente(diente: number): string {
    const estado = this.getEstadoDiente(diente);
    return estado ? estado.color : '#e5e7eb';
  }

  // Calcular edad
  calcularEdad(fecha: string): number | null {
    if (!fecha) return null;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  // Historial de tratamientos
  getEstadoCitaClass(estado: string): string {
    const clases: any = {
      'pendiente': 'badge-warning',
      'confirmada': 'badge-success',
      'cancelada': 'badge-danger',
      'completada': 'badge-info'
    };
    return clases[estado] || 'badge-default';
  }
}