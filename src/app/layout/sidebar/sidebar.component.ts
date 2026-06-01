import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  titulo: string;
  icono: string;
  ruta?: string;
  roles?: string[];
  submenu?: MenuItem[];
  abierto?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']  // ← CAMBIADO a archivo CSS externo
})
export class SidebarComponent {
  menuAbierto = true;
  menuItems: MenuItem[] = [
    {
      titulo: 'Dashboard',
      icono: '📊',
      ruta: '/dashboard',
      roles: ['administrador', 'odontologo', 'recepcion']
    },
    {
      titulo: 'Pacientes',
      icono: '👥',
      ruta: '/pacientes',
      roles: ['administrador', 'odontologo', 'recepcion']
    },
    {
      titulo: 'Citas',
      icono: '📅',
      ruta: '/citas',
      roles: ['administrador', 'odontologo', 'recepcion']
    },
      {
      titulo: 'Tratamientos',
      icono: '💊',
      ruta: '/tratamientos',  // Directo, sin submenú
      roles: ['administrador', 'odontologo']
    },
    {
      titulo: 'Inventario',
      icono: '📦',
      ruta: '/inventario',
      roles: ['administrador', 'odontologo', 'asistente']
    },
   {
      titulo: 'Finanzas',
      icono: '💰',
      ruta: '/finanzas',
      roles: ['administrador']
    },
    {
      titulo: 'Reportes',
      icono: '📑',
      ruta: '/reportes',
      roles: ['administrador', 'odontologo']
    },
    {
      titulo: 'Configuración',
      icono: '⚙️',
      ruta: '/configuracion',
      roles: ['administrador']
    }
  ];

  constructor(private authService: AuthService) {}

  toggleSidebar() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleSubmenu(item: MenuItem) {
    item.abierto = !item.abierto;
  }

  tienePermiso(item: MenuItem): boolean {
    if (!item.roles) return true;
    const usuarioRol = this.authService.getUsuarioRol();
    return item.roles.includes(usuarioRol);
  }
}