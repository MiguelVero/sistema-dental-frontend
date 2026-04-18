import { Routes } from '@angular/router';

// Importar todos los componentes
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CitasComponent } from './pages/citas/citas.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { NuevaCitaComponent } from './pages/nueva-cita/nueva-cita.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'citas', component: CitasComponent },
  { path: 'citas/nueva', component: NuevaCitaComponent },
  { path: 'pacientes', component: PacientesComponent },
  { path: '**', redirectTo: '/dashboard' }
];