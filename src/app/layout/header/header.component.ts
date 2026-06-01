import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  usuario: any = null;
  menuAbierto = false;
  notificacionesAbierto = false;
  notificaciones: any[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.authService.usuarioActual$.subscribe(usuario => {
      this.usuario = usuario;
    });
    this.cargarNotificaciones();
    this.escucharNotificaciones();
    this.escucharEliminacionNotificaciones();
  }

  cargarNotificaciones() {
    this.http.get(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data: any) => {
        const notificacionesBackend = data.notificaciones || [];
        // Filtrar las que ya fueron descartadas
        const descartadas = this.getNotificacionesDescartadas();
        this.notificaciones = notificacionesBackend.filter((n: any) => {
          const id = this.generarIdNotificacion(n);
          return !descartadas.includes(id);
        });
      },
      error: () => {
        this.notificaciones = [];
      }
    });
  }

  escucharNotificaciones() {
    this.subscriptions.push(
      this.socketService.onNuevaNotificacion().subscribe((notif: any) => {
        const id = this.generarIdNotificacion(notif);
        const descartadas = this.getNotificacionesDescartadas();
        
        if (!descartadas.includes(id)) {
          const existe = this.notificaciones.some(n => 
            this.generarIdNotificacion(n) === id
          );
          
          if (!existe) {
            this.notificaciones.unshift(notif);
            if (this.notificaciones.length > 10) {
              this.notificaciones.pop();
            }
          }
        }
      })
    );
  }

  escucharEliminacionNotificaciones() {
    this.subscriptions.push(
      this.socketService.onEliminarNotificacion().subscribe((data: any) => {
        this.notificaciones = this.notificaciones.filter(n => {
          return !(n.tipo === data.tipo && n.mensaje?.includes('Stock bajo'));
        });
      })
    );
  }

  // Generar un ID único para cada notificación
  generarIdNotificacion(notif: any): string {
    return `${notif.tipo}_${notif.mensaje}`;
  }

  // Obtener notificaciones descartadas del localStorage
  getNotificacionesDescartadas(): string[] {
    const guardadas = localStorage.getItem('notificaciones_descartadas');
    return guardadas ? JSON.parse(guardadas) : [];
  }

  // Guardar notificación como descartada
  descartarNotificacion(notif: any) {
    const descartadas = this.getNotificacionesDescartadas();
    const id = this.generarIdNotificacion(notif);
    
    if (!descartadas.includes(id)) {
      descartadas.push(id);
      // Mantener máximo 50 IDs para no llenar localStorage
      if (descartadas.length > 50) {
        descartadas.shift();
      }
      localStorage.setItem('notificaciones_descartadas', JSON.stringify(descartadas));
    }
  }

  navegarDesdeNotificacion(notif: any, index: number) {
    // Descartar esta notificación
    this.descartarNotificacion(notif);
    // Eliminar del array actual
    this.notificaciones.splice(index, 1);
    
    const rutas: any = {
      'cita': '/citas',
      'paciente': '/pacientes',
      'completado': '/citas',
      'inventario': '/inventario',
      'inventario_ok': '/inventario'
    };
    
    const ruta = rutas[notif.tipo] || '/dashboard';
    this.router.navigate([ruta]);
    this.notificacionesAbierto = false;
  }

  limpiarNotificaciones() {
    // Descartar todas las notificaciones actuales
    this.notificaciones.forEach(n => this.descartarNotificacion(n));
    this.notificaciones = [];
    this.notificacionesAbierto = false;
  }

  toggleNotificaciones() {
    this.notificacionesAbierto = !this.notificacionesAbierto;
    this.menuAbierto = false;
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
    this.notificacionesAbierto = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}