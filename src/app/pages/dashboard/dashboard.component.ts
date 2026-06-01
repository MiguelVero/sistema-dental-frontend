import { Component, OnInit, AfterViewInit, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Chart, registerables } from 'chart.js';


Chart.register(...registerables);
registerLocaleData(localeEs, 'es');
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }]  // ← AGREGAR ESTO
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Propiedad para la fecha actual (CORREGIDO)
  today: Date = new Date();
  
 estadisticas = {
    citasHoy: 0,
    citasPendientes: 0,
    pacientesActivos: 0,
    pacientesAtendidosHoy: 0,  // ← AGREGAR
    ingresosHoy: 0,
    egresosHoy: 0,              // ← AGREGAR
    tratamientosHoy: 0,
    inventarioBajo: 0
  };
  
  notificaciones: any[] = [];
  private charts: any = {};

// Inyecta Router en el constructor
constructor(private http: HttpClient, private router: Router) {}


  ngOnInit() {
    this.cargarEstadisticas();
    setInterval(() => {
      this.today = new Date();
    }, 60000);
  }


  ngAfterViewInit() {
    // Pequeño delay para asegurar que el DOM esté renderizado
    setTimeout(() => {
      this.inicializarGraficos();
    }, 100);
  }



   inicializarGraficos(data?: any) {
    this.destruirGraficos();
    
    // Gráfico de ingresos semanales con datos reales
    const ctx1 = document.getElementById('chartIngresos') as HTMLCanvasElement;
    if (ctx1) {
      const labels = data?.ingresosSemanales?.labels || ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      const values = data?.ingresosSemanales?.data || [0, 0, 0, 0, 0, 0];
      
      this.charts.ingresos = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ingresos',
            data: values,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (value) => 'S/ ' + value }
            }
          }
        }
      });
    }

    // Gráfico de tratamientos con datos reales
    const ctx2 = document.getElementById('chartTratamientos') as HTMLCanvasElement;
    if (ctx2) {
      const labels = data?.tratamientosComunes?.labels || ['Sin datos'];
      const values = data?.tratamientosComunes?.data || [0];
      
      this.charts.tratamientos = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  actualizarGraficos() {
    // Actualizar con datos reales cuando se obtengan del backend
    if (this.charts.ingresos) {
      // Aquí puedes actualizar los datos del gráfico de ingresos
      // this.charts.ingresos.data.datasets[0].data = nuevosDatos;
      // this.charts.ingresos.update();
    }
    
    if (this.charts.tratamientos) {
      // Aquí puedes actualizar los datos del gráfico de tratamientos
      // this.charts.tratamientos.data.datasets[0].data = nuevosDatos;
      // this.charts.tratamientos.update();
    }
  }

  private destruirGraficos() {
    if (this.charts.ingresos) {
      this.charts.ingresos.destroy();
    }
    if (this.charts.tratamientos) {
      this.charts.tratamientos.destroy();
    }
  }

 // Generar ID único para notificación
  generarIdNotificacion(notif: any): string {
    return `${notif.tipo}_${notif.mensaje}`;
  }

   // Obtener descartadas
  getNotificacionesDescartadas(): string[] {
    const guardadas = localStorage.getItem('notificaciones_descartadas');
    return guardadas ? JSON.parse(guardadas) : [];
  }

 // Descartar notificación
  descartarNotificacion(notif: any) {
    const descartadas = this.getNotificacionesDescartadas();
    const id = this.generarIdNotificacion(notif);
    
    if (!descartadas.includes(id)) {
      descartadas.push(id);
      if (descartadas.length > 50) {
        descartadas.shift();
      }
      localStorage.setItem('notificaciones_descartadas', JSON.stringify(descartadas));
    }
  }

  cargarEstadisticas() {
    this.http.get(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data: any) => {
        this.estadisticas = {
          citasHoy: data.citasHoy || 0,
          citasPendientes: data.citasPendientes || 0,
          pacientesActivos: data.pacientesActivos || 0,
          pacientesAtendidosHoy: data.pacientesAtendidosHoy || 0,
          ingresosHoy: data.ingresosHoy || 0,
          egresosHoy: data.egresosHoy || 0,
          tratamientosHoy: data.tratamientosHoy || 0,
          inventarioBajo: data.inventarioBajo || 0
        };
        
        if (data.notificaciones) {
          // Filtrar las ya descartadas
          const descartadas = this.getNotificacionesDescartadas();
          this.notificaciones = data.notificaciones.filter((n: any) => {
            return !descartadas.includes(this.generarIdNotificacion(n));
          });
        }
        
        setTimeout(() => {
          this.inicializarGraficos(data);
        }, 200);
      },
      error: () => {
        this.estadisticas = {
          citasHoy: 0, citasPendientes: 0, pacientesActivos: 0,
          pacientesAtendidosHoy: 0, ingresosHoy: 0, egresosHoy: 0,
          tratamientosHoy: 0, inventarioBajo: 0
        };
        this.notificaciones = [];
      }
    });
  }


// Método para navegar desde notificación
  navegarDesdeNotificacion(notif: any, index: number) {
    this.descartarNotificacion(notif);
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
  }

  limpiarNotificaciones() {
    this.notificaciones.forEach(n => this.descartarNotificacion(n));
    this.notificaciones = [];
  }

  // Método para obtener la clase de color según el tipo de notificación
  getNotificacionColor(tipo: string): string {
    const colores: any = {
      'inventario': 'text-yellow-600',
      'cita': 'text-blue-600',
      'paciente': 'text-green-600',
      'alerta': 'text-red-600'
    };
    return colores[tipo] || 'text-gray-600';
  }
}