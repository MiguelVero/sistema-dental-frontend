import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {
  pacientes: any[] = [];
  busqueda: string = '';
  paginaActual: number = 1;
  totalPaginas: number = 0;
  totalPacientes: number = 0;
  private timeoutBusqueda: any;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    const params: any = {
      pagina: this.paginaActual,
      limite: 12
    };
    
    if (this.busqueda) {
      params.busqueda = this.busqueda;
    }

    this.http.get(`${environment.apiUrl}/pacientes`, { params }).subscribe({
      next: (data: any) => {
        this.pacientes = data.pacientes;
        this.totalPacientes = data.total;
        this.totalPaginas = data.totalPaginas;
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
        Swal.fire('Error', 'No se pudieron cargar los pacientes', 'error');
      }
    });
  }

  buscar() {
    this.paginaActual = 1;
    this.cargarPacientes();
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.cargarPacientes();
  }

  nuevoPaciente() {
    Swal.fire({
      title: 'Nuevo Paciente',
      html: `
        <div class="text-left">
          <input id="nombre" class="swal2-input" placeholder="Nombre completo *" required>
          <input id="dni" class="swal2-input" placeholder="DNI">
          <input id="telefono" class="swal2-input" placeholder="Teléfono *" required>
          <input id="email" class="swal2-input" placeholder="Email" type="email">
          <div style="display: flex; gap: 0.5rem;">
         <label for="fecha_nacimiento" class="block text-sm font-medium text-gray-700 mt-2"> Fec. nac.</label>
          <input id="fecha_nacimiento" class="swal2-input" type="date">
        </div> 
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        const dni = (document.getElementById('dni') as HTMLInputElement)?.value;
        const telefono = (document.getElementById('telefono') as HTMLInputElement)?.value;
        const email = (document.getElementById('email') as HTMLInputElement)?.value;
        const fecha_nacimiento = (document.getElementById('fecha_nacimiento') as HTMLInputElement)?.value;
        
        if (!nombre || !telefono) {
          Swal.showValidationMessage('Nombre y teléfono son requeridos');
          return false;
        }
        
        return { nombre, dni, telefono, email, fecha_nacimiento };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardarPaciente(result.value);
      }
    });
  }

  guardarPaciente(paciente: any) {
    this.http.post(`${environment.apiUrl}/pacientes`, paciente).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Paciente registrado correctamente', 'success');
        this.cargarPacientes();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'Error al registrar paciente', 'error');
      }
    });
  }

  eliminarPaciente(id: number, nombre: string) {
    Swal.fire({
      title: '¿Eliminar paciente?',
      text: `¿Estás seguro de eliminar a ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/pacientes/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Paciente eliminado correctamente', 'success');
            this.cargarPacientes();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.error || 'Error al eliminar', 'error');
          }
        });
      }
    });
  }

calcularEdad(fechaNacimiento: string): number | null {
  if (!fechaNacimiento || fechaNacimiento === '0000-00-00') return null;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return null;
  
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}
onBusquedaChange() {
  // Filtrar automáticamente después de 300ms de inactividad
  if (this.timeoutBusqueda) {
    clearTimeout(this.timeoutBusqueda);
  }
  this.timeoutBusqueda = setTimeout(() => {
    this.cargarPacientes(); // o cargarTratamientos()
  }, 300);
}
}