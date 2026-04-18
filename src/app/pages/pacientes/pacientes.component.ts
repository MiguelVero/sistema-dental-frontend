import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {
  pacientes: any[] = [];
  mostrarModal: boolean = false;
  nuevoPacienteData: any = {
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.http.get(`${environment.apiUrl}/pacientes`).subscribe({
      next: (data: any) => this.pacientes = data,
      error: (err) => console.error('Error cargando pacientes:', err)
    });
  }

  nuevoPaciente() {
    Swal.fire({
      title: 'Registrar Nuevo Paciente',
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre completo" required>
        <input id="telefono" class="swal2-input" placeholder="Teléfono" required>
        <input id="email" class="swal2-input" placeholder="Email" type="email">
        <textarea id="direccion" class="swal2-textarea" placeholder="Dirección (opcional)"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const direccion = (document.getElementById('direccion') as HTMLTextAreaElement).value;
        
        if (!nombre || !telefono) {
          Swal.showValidationMessage('Nombre y teléfono son requeridos');
          return false;
        }
        
        return { nombre, telefono, email, direccion };
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
        console.error('Error guardando paciente:', err);
        Swal.fire('Error', 'No se pudo registrar el paciente', 'error');
      }
    });
  }

  editarPaciente(paciente: any) {
    Swal.fire({
      title: 'Editar Paciente',
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre completo" value="${paciente.nombre}" required>
        <input id="telefono" class="swal2-input" placeholder="Teléfono" value="${paciente.telefono}" required>
        <input id="email" class="swal2-input" placeholder="Email" value="${paciente.email || ''}">
        <textarea id="direccion" class="swal2-textarea" placeholder="Dirección">${paciente.direccion || ''}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const direccion = (document.getElementById('direccion') as HTMLTextAreaElement).value;
        
        if (!nombre || !telefono) {
          Swal.showValidationMessage('Nombre y teléfono son requeridos');
          return false;
        }
        
        return { ...paciente, nombre, telefono, email, direccion };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.actualizarPaciente(result.value);
      }
    });
  }

  actualizarPaciente(paciente: any) {
    this.http.put(`${environment.apiUrl}/pacientes/${paciente.id}`, paciente).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Paciente actualizado correctamente', 'success');
        this.cargarPacientes();
      },
      error: (err) => {
        console.error('Error actualizando paciente:', err);
        Swal.fire('Error', 'No se pudo actualizar el paciente', 'error');
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
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/pacientes/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Paciente eliminado correctamente', 'success');
            this.cargarPacientes();
          },
          error: (err) => {
            console.error('Error eliminando paciente:', err);
            Swal.fire('Error', 'No se pudo eliminar el paciente', 'error');
          }
        });
      }
    });
  }
}