import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  fecha: string = '';
  desde: string = '';
  hasta: string = '';
  formato: string = 'pdf';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.inicializarFechas();
  }

  // Helper para fecha local YYYY-MM-DD
  private formatFechaLocal(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  inicializarFechas() {
    const hoy = new Date();
    this.fecha = this.formatFechaLocal(hoy);

    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    this.desde = this.formatFechaLocal(hace7Dias);
    this.hasta = this.formatFechaLocal(hoy);
  }

  descargarReporte(tipo: string) {
    let url = '';
    let params: any = { formato: this.formato };

    switch (tipo) {
      case 'diario':
        url = `${environment.apiUrl}/reportes/diario`;
        params.fecha = this.fecha;
        break;
      case 'tratamientos':
        url = `${environment.apiUrl}/reportes/tratamientos`;
        params.desde = this.desde;
        params.hasta = this.hasta;
        break;
      case 'inventario':
        url = `${environment.apiUrl}/reportes/inventario`;
        params.desde = this.desde;
        params.hasta = this.hasta;
        break;
      case 'flujo-caja':
        url = `${environment.apiUrl}/reportes/flujo-caja`;
        params.desde = this.desde;
        params.hasta = this.hasta;
        break;
    }

    Swal.fire({
      title: 'Generando reporte...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

   this.http.get(url, { params, responseType: 'blob', observe: 'response' }).subscribe({
  next: (response: any) => {
    Swal.close();
    const blob = response.body;
    const contentDisposition = response.headers.get('Content-Disposition');
    
    // Extraer nombre del header o usar fallback con extensión correcta
    let filename = 'reporte.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) filename = match[1];
    } else {
      filename = `reporte.${this.formato === 'excel' ? 'xlsx' : 'pdf'}`;
    }
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    
    Swal.fire({ icon: 'success', title: '✅ Reporte descargado', timer: 1500, showConfirmButton: false });
  },
  error: () => {
    Swal.close();
    Swal.fire('❌ Error', 'No se pudo generar el reporte', 'error');
  }
});
  }
}