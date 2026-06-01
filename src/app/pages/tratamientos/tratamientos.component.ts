import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tratamientos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tratamientos.component.html',
  styleUrls: ['./tratamientos.component.css']
})
export class TratamientosComponent implements OnInit {
  tratamientos: any[] = [];
  busqueda: string = '';
  categoriaFiltro: string = '';
  categorias = [
    { valor: '', label: 'Todas' },
    { valor: 'general', label: 'General' },
    { valor: 'limpieza', label: 'Limpieza' },
    { valor: 'estetica', label: 'Estética' },
    { valor: 'ortodoncia', label: 'Ortodoncia' },
    { valor: 'endodoncia', label: 'Endodoncia' },
    { valor: 'cirugia', label: 'Cirugía' },
    { valor: 'protesis', label: 'Prótesis' },
    { valor: 'otro', label: 'Otro' }
  ];
private timeoutBusqueda: any;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarTratamientos();
  }

  cargarTratamientos() {
    const params: any = {};
    if (this.busqueda) params.busqueda = this.busqueda;
    if (this.categoriaFiltro) params.categoria = this.categoriaFiltro;

    this.http.get(`${environment.apiUrl}/tratamientos`, { params }).subscribe({
      next: (data: any) => {
        this.tratamientos = data;
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los tratamientos', 'error')
    });
  }

nuevoTratamiento() {
    Swal.fire({
      title: '<span style="font-size: 1.25rem;">🦷 Nuevo Tratamiento</span>',
      html: `
        <div style="text-align: left;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="font-size: 0.75rem; color: #6b7280; font-weight: 600; display: block; margin-bottom: 0.25rem;">CÓDIGO</label>
              <input id="codigo" class="swal2-input" placeholder="Ej: TRAT-006" style="width: 100%; box-sizing: border-box;">
            </div>
            <div>
              <label style="font-size: 0.75rem; color: #6b7280; font-weight: 600; display: block; margin-bottom: 0.25rem;">CATEGORÍA</label>
              <select id="categoria" class="swal2-select" style="width: 100%; padding: 0.625rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box;">
                <option value="">Seleccionar</option>
                <option value="general">🦷 General</option>
                <option value="limpieza">🪥 Limpieza</option>
                <option value="estetica">✨ Estética</option>
                <option value="ortodoncia">🔄 Ortodoncia</option>
                <option value="endodoncia">🔧 Endodoncia</option>
                <option value="cirugia">🏥 Cirugía</option>
                <option value="protesis">👑 Prótesis</option>
                <option value="otro">📋 Otro</option>
              </select>
            </div>
          </div>
          
          <div style="margin-top: 0.75rem;">
            <label style="font-size: 0.75rem; color: #6b7280; font-weight: 600; display: block; margin-bottom: 0.25rem;">NOMBRE *</label>
            <input id="nombre" class="swal2-input" placeholder="Nombre del tratamiento" required style="width: 100%; box-sizing: border-box;">
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-top: 0.75rem;">
            <div>
              <label style="font-size: 0.75rem; color: #6b7280; font-weight: 600; display: block; margin-bottom: 0.25rem;">DURACIÓN (min)</label>
              <input id="duracion" class="swal2-input" type="number" placeholder="60" value="60" min="15" max="480" style="width: 100%; box-sizing: border-box;">
            </div>
            <div>
              <label style="font-size: 0.75rem; color: #6b7280; font-weight: 600; display: block; margin-bottom: 0.25rem;">PRECIO (S/)</label>
              <input id="precio" class="swal2-input" type="number" placeholder="0.00" value="0" min="0" step="0.01" style="width: 100%; box-sizing: border-box;">
            </div>
            <div>
              <label style="font-size: 0.75rem; color: #6b7280; font-weight: 600; display: block; margin-bottom: 0.25rem;">COSTO MAT. (S/)</label>
              <input id="costo" class="swal2-input" type="number" placeholder="0.00" value="0" min="0" step="0.01" style="width: 100%; box-sizing: border-box;">
            </div>
          </div>
          
          <div style="margin-top: 0.75rem;">
            <label style="font-size: 0.75rem; color: #6b7280; font-weight: 600; display: block; margin-bottom: 0.25rem;">DESCRIPCIÓN</label>
            <textarea id="descripcion" class="swal2-textarea" placeholder="Descripción del tratamiento..." rows="3" style="width: 100%; box-sizing: border-box;"></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '💾 Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      width: '550px',
      padding: '1.5rem',
      customClass: {
        title: 'swal-title-custom',
        htmlContainer: 'swal-html-custom',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      },
      preConfirm: () => {
        const codigo = (document.getElementById('codigo') as HTMLInputElement)?.value;
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        const categoria = (document.getElementById('categoria') as HTMLSelectElement)?.value;
        const duracion = (document.getElementById('duracion') as HTMLInputElement)?.value;
        const precio = (document.getElementById('precio') as HTMLInputElement)?.value;
        const costo = (document.getElementById('costo') as HTMLInputElement)?.value;
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement)?.value;
        
        if (!nombre) {
          Swal.showValidationMessage('⚠️ El nombre del tratamiento es requerido');
          return false;
        }
        
        return { 
          codigo, 
          nombre, 
          categoria: categoria || 'general', 
          duracion_minutos: parseInt(duracion) || 60, 
          precio: parseFloat(precio) || 0, 
          costo_materiales: parseFloat(costo) || 0, 
          descripcion 
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Registrando...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        this.http.post(`${environment.apiUrl}/tratamientos`, result.value).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '✅ Tratamiento creado',
              text: 'El tratamiento se ha registrado correctamente',
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarTratamientos();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.error || 'No se pudo crear el tratamiento'
            });
          }
        });
      }
    });
  }
  getCategoriaColor(categoria: string): string {
    const colores: any = {
      'general': '#6b7280',
      'limpieza': '#3b82f6',
      'estetica': '#10b981',
      'ortodoncia': '#8b5cf6',
      'endodoncia': '#f59e0b',
      'cirugia': '#ef4444',
      'protesis': '#06b6d4',
      'otro': '#9ca3af'
    };
    return colores[categoria] || '#6b7280';
  }
onBusquedaChange() {
  // Filtrar automáticamente después de 300ms de inactividad
  if (this.timeoutBusqueda) {
    clearTimeout(this.timeoutBusqueda);
  }
  this.timeoutBusqueda = setTimeout(() => {
    this.cargarTratamientos(); // o cargarTratamientos()
  }, 300);
}
eliminarTratamiento(tratamiento: any) {
  Swal.fire({
    title: '¿Eliminar tratamiento?',
    text: `¿Estás seguro de eliminar "${tratamiento.nombre}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    confirmButtonColor: '#dc2626',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.delete(`${environment.apiUrl}/tratamientos/${tratamiento.id}`).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Tratamiento eliminado correctamente', 'success');
          this.cargarTratamientos();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.error || 'No se pudo eliminar', 'error');
        }
      });
    }
  });
}
}