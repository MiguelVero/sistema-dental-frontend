import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tratamiento-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tratamiento-detalle.component.html',
  styleUrls: ['./tratamiento-detalle.component.css']
})
export class TratamientoDetalleComponent implements OnInit {
  tratamiento: any = null;
  estadisticas: any = null;
  citas: any[] = [];
  anotaciones: any[] = [];
  tabActivo: 'info' | 'materiales' | 'anotaciones' | 'historial' = 'info';
  
  // Edición
  editando = false;
  tratamientoEdit: any = {};
  
  // Nueva anotación
  nuevaAnotacion = {
    tipo: 'observacion',
    descripcion: ''
  };

  // Materiales
  materiales: any[] = [];


  // Categorías disponibles
  categorias = [
    'general', 'limpieza', 'estetica', 'ortodoncia', 
    'endodoncia', 'cirugia', 'protesis', 'otro'
  ];

// NUEVO: Productos disponibles del inventario
  productosInventario: any[] = [];
  selectedProductoId: number | null = null;
  usarProductoExistente: boolean = false;
  nuevoMaterial = { nombre: '', cantidad: 1, unidad: 'unidad', producto_id: null };




  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarTratamiento(id);
    }
  }

cargarProductosInventario() {
  this.http.get(`${environment.apiUrl}/inventario/productos`, { params: { limite: 100 } }).subscribe({
    next: (data: any) => {
      this.productosInventario = data.productos || [];
    }
  });
}

  cargarTratamiento(id: string) {
    this.http.get(`${environment.apiUrl}/tratamientos/${id}`).subscribe({
      next: (data: any) => {
        this.tratamiento = data;
        this.estadisticas = data.estadisticas;
        this.citas = data.citas || [];
        this.materiales = data.materiales || [];
        this.tratamientoEdit = { ...data };
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el tratamiento', 'error');
      }
    });
  }

  // Cambiar tabs
  cambiarTab(tab: 'info' | 'materiales' | 'anotaciones' | 'historial') {
    this.tabActivo = tab;
  }

  // Edición
  toggleEdicion() {
    this.editando = !this.editando;
    if (!this.editando) {
      this.tratamientoEdit = { ...this.tratamiento };
    }
  }

  guardarEdicion() {
    this.http.put(`${environment.apiUrl}/tratamientos/${this.tratamiento.id}`, this.tratamientoEdit).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Tratamiento actualizado', 'success');
        this.cargarTratamiento(this.tratamiento.id.toString());
        this.editando = false;
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'Error al actualizar', 'error');
      }
    });
  }

// Método mejorado para agregar material
  agregarMaterial() {
    // Si usa producto existente
    if (this.usarProductoExistente && this.selectedProductoId) {
      const producto = this.productosInventario.find(p => p.id == this.selectedProductoId);
      if (!producto) {
        Swal.fire('Error', 'Selecciona un producto válido', 'error');
        return;
      }
      
      this.nuevoMaterial = {
        nombre: producto.nombre,
        cantidad: 1,
        unidad: producto.unidad,
        producto_id: producto.id
      };
    }

    if (!this.nuevoMaterial.nombre) {
      Swal.fire('Error', 'El nombre del material es requerido', 'error');
      return;
    }

    const materialesActualizados = [
      ...this.materiales,
      { 
        nombre_material: this.nuevoMaterial.nombre,
        cantidad: this.nuevoMaterial.cantidad,
        unidad: this.nuevoMaterial.unidad,
        producto_id: this.usarProductoExistente ? this.selectedProductoId : null
      }
    ];

    this.http.put(`${environment.apiUrl}/tratamientos/${this.tratamiento.id}`, {
      materiales: materialesActualizados
    }).subscribe({
      next: () => {
        this.materiales = materialesActualizados;
        this.nuevoMaterial = { nombre: '', cantidad: 1, unidad: 'unidad', producto_id: null };
        this.selectedProductoId = null;
        this.usarProductoExistente = false;
        Swal.fire('Éxito', 'Material agregado y vinculado al inventario', 'success');
      },
      error: (err) => Swal.fire('Error', err.error?.error || 'No se pudo agregar', 'error')
    });
  }


  eliminarMaterial(index: number) {
    Swal.fire({
      title: '¿Eliminar material?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed) {
        const materialesActualizados = this.materiales.filter((_, i) => i !== index);
        
        this.http.put(`${environment.apiUrl}/tratamientos/${this.tratamiento.id}`, {
          materiales: materialesActualizados
        }).subscribe({
          next: () => {
            this.materiales = materialesActualizados;
            Swal.fire('Eliminado', 'Material eliminado', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  // Anotaciones - Se agregan desde las citas
  cargarAnotaciones(citaId: number) {
    this.http.get(`${environment.apiUrl}/tratamientos/anotaciones/${citaId}`).subscribe({
      next: (data: any) => {
        this.anotaciones = data;
      },
      error: () => {
        this.anotaciones = [];
      }
    });
  }

  agregarAnotacion(citaId: number) {
    if (!this.nuevaAnotacion.descripcion) {
      Swal.fire('Error', 'La descripción es requerida', 'error');
      return;
    }

    this.http.post(`${environment.apiUrl}/tratamientos/anotaciones/${citaId}`, this.nuevaAnotacion).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Anotación agregada', 'success');
        this.cargarAnotaciones(citaId);
        this.nuevaAnotacion = { tipo: 'observacion', descripcion: '' };
      },
      error: () => Swal.fire('Error', 'No se pudo agregar', 'error')
    });
  }

  // Utilidades
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

  getEstadoCitaClass(estado: string): string {
    const clases: any = {
      'pendiente': 'badge-warning',
      'confirmada': 'badge-success',
      'cancelada': 'badge-danger',
      'completada': 'badge-info'
    };
    return clases[estado] || 'badge-default';
  }

  getTipoAnotacionIcono(tipo: string): string {
    const iconos: any = {
      'diagnostico': '🔍',
      'procedimiento': '🩺',
      'observacion': '📝',
      'complicacion': '⚠️',
      'seguimiento': '📊'
    };
    return iconos[tipo] || '📝';
  }

  // Calcular ganancia
  getGanancia(): number {
    if (!this.tratamiento) return 0;
    return (this.tratamiento.precio || 0) - (this.tratamiento.costo_materiales || 0);
  }

  getMargen(): number {
    if (!this.tratamiento || !this.tratamiento.precio) return 0;
    return Math.round((this.getGanancia() / this.tratamiento.precio) * 100);
  }
}