import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const rol = this.authService.getUsuarioRol();
    if (rol === 'administrador') {
      return true;
    }
    
    this.router.navigate(['/dashboard']);
    return false;
  }
}