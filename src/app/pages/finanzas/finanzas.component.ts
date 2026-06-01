import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './finanzas.component.html',
  styleUrls: ['./finanzas.component.css']
})
export class FinanzasComponent implements OnInit {
  tabActivo: 'ingresos' | 'egresos' | 'flujo-caja' = 'ingresos';
  
  // Ingresos
  ingresos: any[] = [];
  totalIngresos: number = 0;
  
  // Egresos
  egresos: any[] = [];
  totalEgresos: number = 0;
  categoriasGasto: any[] = [];
  
  // Flujo de caja
  flujoCaja: any = null;
  
  // Filtros
  fechaDesde: string = '';
  fechaHasta: string = '';
  
  // Métodos de pago
  metodosPago = ['efectivo', 'tarjeta', 'transferencia', 'otro'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // CORREGIDO: Fecha local Perú (no UTC)
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    const fechaLocal = `${year}-${month}-${day}`;
    
    this.fechaDesde = fechaLocal;
    this.fechaHasta = fechaLocal;
    this.cargarIngresos();
    this.cargarCategorias();
  }

  // Helper para fecha local
  private getFechaLocal(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cambiarTab(tab: 'ingresos' | 'egresos' | 'flujo-caja') {
    this.tabActivo = tab;
    if (tab === 'ingresos') this.cargarIngresos();
    if (tab === 'egresos') this.cargarEgresos();
    if (tab === 'flujo-caja') this.cargarFlujoCaja();
  }

  // ===== INGRESOS =====
  cargarIngresos() {
    const params: any = {};
    if (this.fechaDesde) params.desde = this.fechaDesde;
    if (this.fechaHasta) params.hasta = this.fechaHasta;

    this.http.get(`${environment.apiUrl}/finanzas/ingresos`, { params }).subscribe({
      next: (data: any) => {
        this.ingresos = data.ingresos || [];
        this.totalIngresos = data.total || 0;
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los ingresos', 'error')
    });
  }

  nuevoIngreso() {
    const fechaLocal = this.getFechaLocal();
    
    Swal.fire({
      title: '💰 Nuevo Ingreso',
      html: `
        <div style="text-align:left">
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">DESCRIPCIÓN *</label>
          <input id="descripcion" class="swal2-input" placeholder="Motivo del ingreso" required>
          
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">MONTO (S/) *</label>
          <input id="monto" class="swal2-input" type="number" placeholder="0.00" step="0.01" required>
          
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">MÉTODO DE PAGO</label>
          <select id="metodo" class="swal2-select" style="width:100%;padding:0.5rem;margin:0.25rem 0">
            <option value="efectivo">💵 Efectivo</option>
            <option value="tarjeta">💳 Tarjeta</option>
            <option value="transferencia">🏦 Transferencia</option>
            <option value="otro">📋 Otro</option>
          </select>
          
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">FECHA</label>
          <input id="fecha" class="swal2-input" type="date" value="${fechaLocal}">
          
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">NOTAS (opcional)</label>
          <textarea id="notas" class="swal2-textarea" placeholder="Información adicional..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '💾 Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      width: '480px',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement)?.value;
        const monto = parseFloat((document.getElementById('monto') as HTMLInputElement)?.value);
        if (!descripcion || !monto) {
          Swal.showValidationMessage('Descripción y monto son requeridos');
          return false;
        }
        return {
          descripcion,
          monto,
          metodo_pago: (document.getElementById('metodo') as HTMLSelectElement)?.value,
          fecha: (document.getElementById('fecha') as HTMLInputElement)?.value,
          notas: (document.getElementById('notas') as HTMLTextAreaElement)?.value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${environment.apiUrl}/finanzas/ingresos`, result.value).subscribe({
          next: () => {
            Swal.fire('✅ Éxito', 'Ingreso registrado correctamente', 'success');
            this.cargarIngresos();
          },
          error: (err) => Swal.fire('❌ Error', err.error?.error || 'Error al registrar', 'error')
        });
      }
    });
  }

  // ===== EGRESOS =====
  cargarCategorias() {
    this.http.get(`${environment.apiUrl}/finanzas/categorias`).subscribe({
      next: (data: any) => this.categoriasGasto = data
    });
  }

  cargarEgresos() {
    const params: any = {};
    if (this.fechaDesde) params.desde = this.fechaDesde;
    if (this.fechaHasta) params.hasta = this.fechaHasta;

    this.http.get(`${environment.apiUrl}/finanzas/egresos`, { params }).subscribe({
      next: (data: any) => {
        this.egresos = data.egresos || [];
        this.totalEgresos = data.total || 0;
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los egresos', 'error')
    });
  }

  nuevoEgreso() {
    const fechaLocal = this.getFechaLocal();
    const categoriasOptions = this.categoriasGasto
      .map(c => `<option value="${c.id}">📂 ${c.nombre}${c.es_fijo ? ' (Fijo)' : ''}</option>`)
      .join('');

    Swal.fire({
      title: '💸 Nuevo Egreso',
      html: `
        <div style="text-align:left">
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">CATEGORÍA</label>
          <select id="categoria" class="swal2-select" style="width:100%;padding:0.5rem;margin:0.25rem 0">
            <option value="">Seleccionar categoría</option>
            ${categoriasOptions}
          </select>
          
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">DESCRIPCIÓN *</label>
          <input id="descripcion" class="swal2-input" placeholder="Motivo del egreso" required>
          
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">MONTO (S/) *</label>
          <input id="monto" class="swal2-input" type="number" placeholder="0.00" step="0.01" required>
          
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">FECHA</label>
          <input id="fecha" class="swal2-input" type="date" value="${fechaLocal}">
          
          <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">NOTAS (opcional)</label>
          <textarea id="notas" class="swal2-textarea" placeholder="Información adicional..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '💾 Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      width: '480px',
      preConfirm: () => {
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement)?.value;
        const monto = parseFloat((document.getElementById('monto') as HTMLInputElement)?.value);
        if (!descripcion || !monto) {
          Swal.showValidationMessage('Descripción y monto son requeridos');
          return false;
        }
        return {
          categoria_id: (document.getElementById('categoria') as HTMLSelectElement)?.value || null,
          descripcion,
          monto,
          fecha: (document.getElementById('fecha') as HTMLInputElement)?.value,
          notas: (document.getElementById('notas') as HTMLTextAreaElement)?.value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${environment.apiUrl}/finanzas/egresos`, result.value).subscribe({
          next: () => {
            Swal.fire('✅ Éxito', 'Egreso registrado correctamente', 'success');
            this.cargarEgresos();
          },
          error: (err) => Swal.fire('❌ Error', err.error?.error || 'Error al registrar', 'error')
        });
      }
    });
  }

  // ===== FLUJO DE CAJA =====
  cargarFlujoCaja() {
    const params: any = {};
    if (this.fechaDesde) params.desde = this.fechaDesde;
    if (this.fechaHasta) params.hasta = this.fechaHasta;

    this.http.get(`${environment.apiUrl}/finanzas/flujo-caja`, { params }).subscribe({
      next: (data: any) => {
        this.flujoCaja = data;
      },
      error: () => Swal.fire('Error', 'No se pudo cargar el flujo de caja', 'error')
    });
  }

  getMetodoPagoLabel(metodo: string): string {
    const labels: any = {
      'efectivo': '💵 Efectivo',
      'tarjeta': '💳 Tarjeta',
      'transferencia': '🏦 Transferencia',
      'otro': '📋 Otro'
    };
    return labels[metodo] || metodo;
  }

  getFlujoClass(valor: number): string {
    if (valor > 0) return 'text-green';
    if (valor < 0) return 'text-red';
    return 'text-gray';
  }

  getRolColor(rol: string): string {
    const colores: any = {
      'administrador': '#8b5cf6',
      'odontologo': '#3b82f6',
      'recepcion': '#10b981',
      'asistente': '#f59e0b'
    };
    return colores[rol] || '#6b7280';
  }
  
  actualizarFiltros() {
    if (this.tabActivo === 'ingresos') this.cargarIngresos();
    if (this.tabActivo === 'egresos') this.cargarEgresos();
    if (this.tabActivo === 'flujo-caja') this.cargarFlujoCaja();
  }
}