import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  tabActivo: 'usuarios' | 'bitacora' | 'general' = 'usuarios';

  usuarios: any[] = [];
  registrosBitacora: any[] = [];
  
  config: any = {
    hora_inicio: '08:00',
    hora_fin: '20:00',
    intervalo_citas: '30',
    nombre_clinica: 'Perfect Dent',
    direccion_clinica: '',
    telefono_clinica: '',
    impuesto: '18',
    moneda: 'S/'
  };

  // Filtros de bitácora
  filtroUsuario: string = '';
  filtroModulo: string = '';
  filtroDesde: string = '';
  filtroHasta: string = '';
  sinLogin: boolean = true;  // Por defecto ocultar inicios de sesión
  usuariosFiltro: any[] = [];
  modulosFiltro: string[] = [];
  paginaBitacora: number = 1;
  totalPaginasBitacora: number = 0;
  totalRegistrosBitacora: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cambiarTab(tab: 'usuarios' | 'bitacora' | 'general') {
    this.tabActivo = tab;
    if (tab === 'usuarios') this.cargarUsuarios();
    if (tab === 'bitacora') this.cargarBitacora();
    if (tab === 'general') this.cargarConfiguracion();
  }

  // ===== USUARIOS =====
  cargarUsuarios() {
    this.http.get(`${environment.apiUrl}/configuracion/usuarios`).subscribe({
      next: (data: any) => this.usuarios = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error')
    });
  }

  nuevoUsuario() {
    Swal.fire({
      title: '👤 Nuevo Usuario',
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre completo">
        <input id="email" class="swal2-input" placeholder="Correo electrónico" type="email">
        <input id="password" class="swal2-input" placeholder="Contraseña" type="password">
        <select id="rol" class="swal2-select" style="width:100%;padding:0.5rem;margin-top:0.5rem">
          <option value="odontologo">Odontólogo</option>
          <option value="recepcion">Recepción</option>
          <option value="asistente">Asistente</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        const email = (document.getElementById('email') as HTMLInputElement)?.value;
        const password = (document.getElementById('password') as HTMLInputElement)?.value;
        const rol = (document.getElementById('rol') as HTMLSelectElement)?.value;
        if (!nombre || !email || !password) {
          Swal.showValidationMessage('Todos los campos son requeridos');
          return false;
        }
        return { nombre, email, password, rol };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`${environment.apiUrl}/configuracion/usuarios`, result.value).subscribe({
          next: () => { Swal.fire('✅ Éxito', 'Usuario creado', 'success'); this.cargarUsuarios(); },
          error: (err) => Swal.fire('❌ Error', err.error?.error || 'Error', 'error')
        });
      }
    });
  }

  toggleUsuario(usuario: any) {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `${usuario.nombre} (${usuario.rol})`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.patch(`${environment.apiUrl}/configuracion/usuarios/${usuario.id}/toggle`, {}).subscribe({
          next: () => { Swal.fire('✅ Hecho', `Usuario ${accion}do`, 'success'); this.cargarUsuarios(); },
          error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
        });
      }
    });
  }

  editarUsuario(usuario: any) {
    Swal.fire({
      title: '✏️ Editar Usuario',
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre completo" value="${usuario.nombre}">
        <input id="email" class="swal2-input" placeholder="Correo electrónico" value="${usuario.email}">
        <input id="password" class="swal2-input" placeholder="Nueva contraseña (dejar vacío para no cambiar)" type="password">
        <select id="rol" class="swal2-select" style="width:100%;padding:0.5rem;margin-top:0.5rem">
          <option value="administrador" ${usuario.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
          <option value="odontologo" ${usuario.rol === 'odontologo' ? 'selected' : ''}>Odontólogo</option>
          <option value="recepcion" ${usuario.rol === 'recepcion' ? 'selected' : ''}>Recepción</option>
          <option value="asistente" ${usuario.rol === 'asistente' ? 'selected' : ''}>Asistente</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value;
        const email = (document.getElementById('email') as HTMLInputElement)?.value;
        const password = (document.getElementById('password') as HTMLInputElement)?.value;
        const rol = (document.getElementById('rol') as HTMLSelectElement)?.value;
        if (!nombre || !email) {
          Swal.showValidationMessage('Nombre y email son requeridos');
          return false;
        }
        const data: any = { nombre, email, rol };
        if (password) data.password = password;
        return data;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.put(`${environment.apiUrl}/configuracion/usuarios/${usuario.id}`, result.value).subscribe({
          next: () => { Swal.fire('✅ Éxito', 'Usuario actualizado', 'success'); this.cargarUsuarios(); },
          error: (err) => Swal.fire('❌ Error', err.error?.error || 'Error', 'error')
        });
      }
    });
  }

  // ===== BITÁCORA =====
  cargarBitacora() {
    const params: any = {
      pagina: this.paginaBitacora,
      limite: 20
    };
    
    if (this.filtroUsuario) params.usuario = this.filtroUsuario;
    if (this.filtroModulo) params.modulo = this.filtroModulo;
    if (this.filtroDesde) params.desde = this.filtroDesde;
    if (this.filtroHasta) params.hasta = this.filtroHasta;
    if (this.sinLogin) params.sinLogin = 'true';

    this.http.get(`${environment.apiUrl}/configuracion/bitacora`, { params }).subscribe({
      next: (data: any) => {
        this.registrosBitacora = data.registros || [];
        this.totalRegistrosBitacora = data.total;
        this.totalPaginasBitacora = data.totalPaginas;
        this.usuariosFiltro = data.filtros?.usuarios || [];
        this.modulosFiltro = data.filtros?.modulos || [];
      },
      error: () => Swal.fire('Error', 'No se pudo cargar la bitácora', 'error')
    });
  }

  cambiarPaginaBitacora(pagina: number) {
    this.paginaBitacora = pagina;
    this.cargarBitacora();
  }

  limpiarFiltros() {
    this.filtroUsuario = '';
    this.filtroModulo = '';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.sinLogin = true;
    this.paginaBitacora = 1;
    this.cargarBitacora();
  }

  // ===== CONFIGURACIÓN GENERAL =====
  cargarConfiguracion() {
    this.http.get(`${environment.apiUrl}/configuracion`).subscribe({
      next: (data: any) => { if (data) this.config = { ...this.config, ...data }; },
      error: () => {}
    });
  }

  guardarConfiguracion() {
    this.http.put(`${environment.apiUrl}/configuracion`, this.config).subscribe({
      next: () => Swal.fire('✅ Éxito', 'Configuración actualizada', 'success'),
      error: () => Swal.fire('❌ Error', 'No se pudo guardar', 'error')
    });
  }
}