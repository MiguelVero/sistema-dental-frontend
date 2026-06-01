import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  editando = false;
  perfilEdit: any = {};

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.http.get(`${environment.apiUrl}/auth/profile`).subscribe({
      next: (data: any) => {
        this.usuario = data;
        this.perfilEdit = { ...data };
      },
      error: () => Swal.fire('Error', 'No se pudo cargar el perfil', 'error')
    });
  }

  guardarPerfil() {
    this.http.put(`${environment.apiUrl}/configuracion/usuarios/${this.usuario.id}`, this.perfilEdit).subscribe({
      next: () => {
        Swal.fire('✅ Éxito', 'Perfil actualizado', 'success');
        this.editando = false;
        this.cargarPerfil();
      },
      error: (err) => Swal.fire('❌ Error', err.error?.error || 'Error', 'error')
    });
  }
}