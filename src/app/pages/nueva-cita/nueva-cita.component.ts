import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CitaService } from '../../services/cita.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

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

  constructor(
    private citaService: CitaService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarPacientes();
    this.cargarTratamientos();
  }

  cargarPacientes() {
    this.http.get(`${environment.apiUrl}/pacientes`).subscribe({
      next: (data: any) => this.pacientes = data
    });
  }

  cargarTratamientos() {
    this.http.get(`${environment.apiUrl}/tratamientos`).subscribe({
      next: (data: any) => this.tratamientos = data
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