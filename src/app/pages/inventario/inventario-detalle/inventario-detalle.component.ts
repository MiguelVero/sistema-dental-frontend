import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventario-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventario-detalle.component.html',
  styleUrls: ['./inventario-detalle.component.css']
})
export class InventarioDetalleComponent implements OnInit {
  producto: any = null;
  movimientos: any[] = [];
  tabActivo: 'info' | 'movimientos' = 'info';
  
  // Edición
  editando = false;
  productoEdit: any = {};

  // Movimientos
  cantidadMovimiento: number = 1;
  motivoMovimiento: string = '';
  categorias: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(id);
      this.cargarCategorias();
    }
  }

  cargarCategorias() {
    this.http.get(`${environment.apiUrl}/inventario/categorias`).subscribe({
      next: (data: any) => this.categorias = data
    });
  }

  cargarProducto(id: string) {
    this.http.get(`${environment.apiUrl}/inventario/productos/${id}`).subscribe({
      next: (data: any) => {
        this.producto = data;
        this.movimientos = data.movimientos || [];
        this.productoEdit = { ...data };
      },
      error: () => Swal.fire('Error', 'No se pudo cargar el producto', 'error')
    });
  }

  cambiarTab(tab: 'info' | 'movimientos') {
    this.tabActivo = tab;
  }

  toggleEdicion() {
    this.editando = !this.editando;
    if (!this.editando) {
      this.productoEdit = { ...this.producto };
    }
  }

  guardarEdicion() {
    this.http.put(`${environment.apiUrl}/inventario/productos/${this.producto.id}`, this.productoEdit).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Producto actualizado', 'success');
        this.cargarProducto(this.producto.id.toString());
        this.editando = false;
      },
      error: (err) => Swal.fire('Error', err.error?.error || 'Error al actualizar', 'error')
    });
  }

  // Movimientos
  registrarEntrada() {
    if (!this.cantidadMovimiento || this.cantidadMovimiento <= 0) {
      Swal.fire('Error', 'Ingresa una cantidad válida', 'error');
      return;
    }

    this.http.post(`${environment.apiUrl}/inventario/productos/${this.producto.id}/entrada`, {
      cantidad: this.cantidadMovimiento,
      motivo: this.motivoMovimiento || 'Entrada manual'
    }).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Entrada registrada correctamente', 'success');
        this.cargarProducto(this.producto.id.toString());
        this.cantidadMovimiento = 1;
        this.motivoMovimiento = '';
      },
      error: (err) => Swal.fire('Error', err.error?.error || 'Error al registrar', 'error')
    });
  }

  registrarSalida() {
    if (!this.cantidadMovimiento || this.cantidadMovimiento <= 0) {
      Swal.fire('Error', 'Ingresa una cantidad válida', 'error');
      return;
    }

    this.http.post(`${environment.apiUrl}/inventario/productos/${this.producto.id}/salida`, {
      cantidad: this.cantidadMovimiento,
      motivo: this.motivoMovimiento || 'Salida manual'
    }).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Salida registrada correctamente', 'success');
        this.cargarProducto(this.producto.id.toString());
        this.cantidadMovimiento = 1;
        this.motivoMovimiento = '';
      },
      error: (err) => Swal.fire('Error', err.error?.error || 'Error al registrar', 'error')
    });
  }

  // Utilidades
  getStockClass(): string {
    if (!this.producto) return '';
    if (this.producto.stock_actual <= 0) return 'stock-agotado';
    if (this.producto.stock_actual <= this.producto.stock_minimo) return 'stock-bajo';
    return 'stock-normal';
  }

  getStockLabel(): string {
    if (!this.producto) return '';
    if (this.producto.stock_actual <= 0) return 'AGOTADO';
    if (this.producto.stock_actual <= this.producto.stock_minimo) return 'STOCK BAJO';
    return 'STOCK OK';
  }

  getPorcentajeStock(): number {
    if (!this.producto || !this.producto.stock_maximo) return 100;
    return Math.round((this.producto.stock_actual / this.producto.stock_maximo) * 100);
  }

  getTipoMovimientoIcono(tipo: string): string {
    const iconos: any = {
      'entrada': '📥',
      'salida': '📤',
      'ajuste': '⚙️'
    };
    return iconos[tipo] || '📋';
  }

  getTipoMovimientoClass(tipo: string): string {
    const clases: any = {
      'entrada': 'mov-entrada',
      'salida': 'mov-salida',
      'ajuste': 'mov-ajuste'
    };
    return clases[tipo] || '';
  }

  formatoFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-PE');
  }
}