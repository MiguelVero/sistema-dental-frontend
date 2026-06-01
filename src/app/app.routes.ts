import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NuevaCitaComponent } from './pages/nueva-cita/nueva-cita.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { PacienteDetalleComponent } from './pages/pacientes/paciente-detalle/paciente-detalle.component';
import { TratamientosComponent } from './pages/tratamientos/tratamientos.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { TratamientoDetalleComponent } from './pages/tratamientos/tratamiento-detalle/tratamiento-detalle.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { InventarioDetalleComponent } from './pages/inventario/inventario-detalle/inventario-detalle.component';
import { FinanzasComponent } from './pages/finanzas/finanzas.component';
import { AgendaCitasComponent } from './pages/citas/agenda-citas/agenda-citas.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'citas', component: AgendaCitasComponent },
      { path: 'citas/nueva', component: NuevaCitaComponent },
      { path: 'pacientes', component: PacientesComponent },
      { path: 'pacientes',
          children: [
            { path: '', component: PacientesComponent },
            { path: ':id', component: PacienteDetalleComponent },
          ]
      },
      { path: 'tratamientos',
          children: [
            { path: '', component: TratamientosComponent },
            { path: ':id', component: TratamientoDetalleComponent },
          ]
      },
      { path: 'inventario',
          children: [
            { path: '', component: InventarioComponent },
            { path: ':id', component: InventarioDetalleComponent },
          ]
      },
      { path: 'finanzas', component: FinanzasComponent },
      { path: 'reportes', component: ReportesComponent },
      // SOLO ADMIN PUEDE ACCEDER A CONFIGURACIÓN
      { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AdminGuard] },
      { path: 'perfil', component: PerfilComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];