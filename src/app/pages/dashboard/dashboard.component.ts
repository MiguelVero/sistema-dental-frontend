import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../services/cita.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  citasHoy: number = 0;
  citasPendientes: number = 0;
  totalPacientes: number = 0;

  constructor(private citaService: CitaService) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.citaService.getCitas().subscribe(citas => {
      const hoy = new Date().toISOString().split('T')[0];
      this.citasHoy = citas.filter(c => c.fecha === hoy).length;
      this.citasPendientes = citas.filter(c => c.estado === 'pendiente').length;
    });
  }
}