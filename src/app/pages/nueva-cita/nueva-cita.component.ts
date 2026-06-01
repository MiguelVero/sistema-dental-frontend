import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-nueva-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nueva-cita.component.html',
  styleUrls: ['./nueva-cita.component.css']
})
export class NuevaCitaComponent implements OnInit {
  cita: any = {};
  pacientes: any[] = [];
  tratamientos: any[] = [];
  odontologos: any[] = [];  // ← NUEVO
  constructor(
    private citaService: CitaService,
    private http: HttpClient,
    private router: Router,
  private route: ActivatedRoute  // ← AGREGAR
  ) {}

  ngOnInit() {
    this.cargarPacientes();
    this.cargarTratamientos();
    this.cargarOdontologos();  // ← NUEVO
     // Recibir fecha desde el calendario
this.route.queryParams.subscribe(params => {
  if (params['fecha']) {
    this.cita.fecha = params['fecha'];
  }
  if (params['hora']) {
    this.cita.hora = params['hora'];
  }
});
  }
cargarOdontologos() {
  this.http.get(`${environment.apiUrl}/auth/odontologos`).subscribe({
    next: (data: any) => {
      if (Array.isArray(data)) {
        this.odontologos = data;
      } else {
        this.odontologos = [];
      }
    },
    error: () => this.odontologos = []
  });
}

  cargarPacientes() {
  this.http.get(`${environment.apiUrl}/pacientes`).subscribe({
    next: (data: any) => {
      // Verificar si viene como objeto paginado o array directo
      if (Array.isArray(data)) {
        this.pacientes = data;
      } else if (data.pacientes) {
        this.pacientes = data.pacientes; // Formato paginado
      } else {
        this.pacientes = [];
      }
    },
    error: () => this.pacientes = []
  });
}


 cargarTratamientos() {
  this.http.get(`${environment.apiUrl}/tratamientos`).subscribe({
    next: (data: any) => {
      if (Array.isArray(data)) {
        this.tratamientos = data;
      } else {
        this.tratamientos = [];
      }
    },
    error: () => this.tratamientos = []
  });
}

  guardarCita() {
    this.citaService.crearCita(this.cita).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Cita creada correctamente', 'success');
        this.router.navigate(['/citas']);
      },
      error: () => Swal.fire('Error', 'No se pudo crear la cita', 'error')
    });
  }
}