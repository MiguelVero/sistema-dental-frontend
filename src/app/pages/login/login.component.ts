import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']  // ← CAMBIADO a archivo CSS externo
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      Swal.fire('Error', 'Por favor complete todos los campos', 'error');
      return;
    }

    this.loading = true;
    
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        Swal.fire('Éxito', 'Inicio de sesión exitoso', 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.error?.error || 'Credenciales inválidas', 'error');
        this.loading = false;
      }
    });
  }
recuperarPassword() {
  Swal.fire({
    title: 'Recuperar Contraseña',
    text: 'Ingresa tu correo electrónico para recibir un enlace de recuperación',
    input: 'email',
    inputPlaceholder: 'admin@clinicadental.com',
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debes ingresar un correo electrónico';
      }
      return null;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.recuperarPassword(result.value).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Enlace enviado',
            text: res.mensaje || 'Revisa tu correo electrónico',
            footer: res.resetUrl ? `<small>Desarrollo: <a href="${res.resetUrl}" target="_blank">${res.resetUrl}</a></small>` : ''
          });
        },
        error: (err) => {
          Swal.fire('Error', err.error?.error || 'No se pudo procesar la solicitud', 'error');
        }
      });
    }
  });
}




}