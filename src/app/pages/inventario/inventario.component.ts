import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  productos: any[] = [];
  categorias: any[] = [];
  alertas: number = 0;
  busqueda: string = '';
  categoriaFiltro: string = '';
  soloStockBajo: boolean = false;
  paginaActual: number = 1;
  totalPaginas: number = 0;
  private timeoutBusqueda: any;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias() {
    this.http.get(`${environment.apiUrl}/inventario/categorias`).subscribe({
      next: (data: any) => this.categorias = data
    });
  }

  cargarProductos() {
    const params: any = {
      pagina: this.paginaActual,
      limite: 20
    };
    if (this.busqueda) params.busqueda = this.busqueda;
    if (this.categoriaFiltro) params.categoria = this.categoriaFiltro;
    if (this.soloStockBajo) params.stockBajo = 'true';

    this.http.get(`${environment.apiUrl}/inventario/productos`, { params }).subscribe({
      next: (data: any) => {
        this.productos = data.productos;
        this.alertas = data.alertas;
        this.totalPaginas = data.totalPaginas;
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los productos', 'error')
    });
  }

nuevoProducto() {
    Swal.fire({
      title: '📦 Nuevo Producto',
      html: `
        <div style="text-align:left">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
            <div>
              <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">CÓDIGO</label>
              <input id="codigo" class="swal2-input" placeholder="Ej: MAT-007">
            </div>
            <div>
              <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">NOMBRE *</label>
              <input id="nombre" class="swal2-input" placeholder="Nombre del producto" required>
            </div>
          </div>
          
          <div style="margin-top:0.5rem;">
            <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">CATEGORÍA</label>
            <select id="categoria" class="swal2-select" style="width:100%;padding:0.5rem;border:1px solid #d1d5db;border-radius:0.375rem;">
              <option value="">Seleccionar categoría</option>
              ${this.categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
            </select>
          </div>
          
          <div style="margin-top:0.75rem;padding:0.5rem;background:#f9fafb;border-radius:0.375rem;">
            <p style="font-size:0.7rem;color:#6b7280;font-weight:600;margin-bottom:0.5rem;">📊 STOCK</p>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;">
              <div>
                <label style="font-size:0.6rem;color:#9ca3af;">Stock Inicial</label>
                <input id="stock" class="swal2-input" type="number" placeholder="0" value="0" min="0">
              </div>
              <div>
                <label style="font-size:0.6rem;color:#9ca3af;">Stock Mínimo</label>
                <input id="stock_minimo" class="swal2-input" type="number" placeholder="5" value="5" min="0">
              </div>
              <div>
                <label style="font-size:0.6rem;color:#9ca3af;">Stock Máximo</label>
                <input id="stock_maximo" class="swal2-input" type="number" placeholder="100" value="100" min="0">
              </div>
            </div>
          </div>
          
          <div style="margin-top:0.5rem;padding:0.5rem;background:#f0fdf4;border-radius:0.375rem;">
            <p style="font-size:0.7rem;color:#6b7280;font-weight:600;margin-bottom:0.5rem;">💰 PRECIOS</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
              <div>
                <label style="font-size:0.6rem;color:#9ca3af;">Precio Compra (S/)</label>
                <input id="precio_compra" class="swal2-input" type="number" placeholder="0.00" value="0" step="0.01">
              </div>
              <div>
                <label style="font-size:0.6rem;color:#9ca3af;">Precio Venta (S/)</label>
                <input id="precio_venta" class="swal2-input" type="number" placeholder="0.00" value="0" step="0.01">
              </div>
            </div>
          </div>
          
          <div style="margin-top:0.5rem;">
            <label style="font-size:0.7rem;color:#6b7280;font-weight:600;">PROVEEDOR</label>
            <input id="proveedor" class="swal2-input" placeholder="Nombre del proveedor">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '💾 Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      width: '500px',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        if (!nombre) { Swal.showValidationMessage('⚠️ El nombre es requerido'); return false; }
        return {
          codigo: (document.getElementById('codigo') as HTMLInputElement)?.value || null,
          nombre,
          categoria_id: (document.getElementById('categoria') as HTMLSelectElement)?.value || null,
          stock_actual: parseInt((document.getElementById('stock') as HTMLInputElement)?.value) || 0,
          stock_minimo: parseInt((document.getElementById('stock_minimo') as HTMLInputElement)?.value) || 5,
          stock_maximo: parseInt((document.getElementById('stock_maximo') as HTMLInputElement)?.value) || 100,
          precio_compra: parseFloat((document.getElementById('precio_compra') as HTMLInputElement)?.value) || 0,
          precio_venta: parseFloat((document.getElementById('precio_venta') as HTMLInputElement)?.value) || 0,
          proveedor: (document.getElementById('proveedor') as HTMLInputElement)?.value || null
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${environment.apiUrl}/inventario/productos`, result.value).subscribe({
          next: () => { Swal.fire('✅ Éxito', 'Producto creado correctamente', 'success'); this.cargarProductos(); },
          error: (err) => Swal.fire('❌ Error', err.error?.error || 'Error al crear producto', 'error')
        });
      }
    });
  }

  registrarMovimiento(producto: any, tipo: 'entrada' | 'salida') {
    Swal.fire({
      title: tipo === 'entrada' ? '📥 Registrar Entrada' : '📤 Registrar Salida',
      html: `
        <p><strong>Producto:</strong> ${producto.nombre}</p>
        <p><strong>Stock actual:</strong> ${producto.stock_actual}</p>
        <input id="cantidad" class="swal2-input" type="number" placeholder="Cantidad" min="1">
        <input id="motivo" class="swal2-input" placeholder="Motivo">
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      preConfirm: () => {
        const cantidad = parseInt((document.getElementById('cantidad') as HTMLInputElement)?.value);
        if (!cantidad || cantidad <= 0) { Swal.showValidationMessage('Cantidad inválida'); return false; }
        return {
          cantidad,
          motivo: (document.getElementById('motivo') as HTMLInputElement)?.value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${environment.apiUrl}/inventario/productos/${producto.id}/${tipo}`, result.value).subscribe({
          next: () => { Swal.fire('Éxito', 'Movimiento registrado', 'success'); this.cargarProductos(); },
          error: (err) => Swal.fire('Error', err.error?.error || 'Error', 'error')
        });
      }
    });
  }

  getStockClass(producto: any): string {
    if (producto.stock_actual <= 0) return 'stock-agotado';
    if (producto.stock_actual <= producto.stock_minimo) return 'stock-bajo';
    return 'stock-normal';
  }

  getStockLabel(producto: any): string {
    if (producto.stock_actual <= 0) return 'AGOTADO';
    if (producto.stock_actual <= producto.stock_minimo) return 'BAJO';
    return 'OK';
  }

  onBusquedaChange() {
  if (this.timeoutBusqueda) {
    clearTimeout(this.timeoutBusqueda);
  }
  this.timeoutBusqueda = setTimeout(() => {
    this.paginaActual = 1;
    this.cargarProductos();
  }, 300);
}
}