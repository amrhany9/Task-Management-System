import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // The host lands on the login screen.
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Auth routes render outside the shell, so the navbar never appears on them.
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
      }
    ]
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'projects',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/projects/project-list/project-list.component').then((m) => m.ProjectListComponent)
      },
      {
        path: 'projects/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/projects/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
