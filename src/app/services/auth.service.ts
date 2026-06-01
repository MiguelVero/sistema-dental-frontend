import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private usuarioActual = new BehaviorSubject<Usuario | null>(null);
  usuarioActual$ = this.usuarioActual.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuario();
  }

login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
         // console.log('✅ Token recibido:', response.token); // ← ELIMINAR O COMENTAR
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
        this.usuarioActual.next(response.usuario);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioActual.next(null);
  }

  private cargarUsuario() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      this.usuarioActual.next(JSON.parse(usuario));
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuarioRol(): string {
    const usuario = this.usuarioActual.value;
    return usuario?.rol || '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  recuperarPassword(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/recuperar-password`, { email });
}
}