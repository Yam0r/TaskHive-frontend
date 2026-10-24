import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { TasksComponent } from './pages/tasks/tasks';
import { TeamComponent } from './pages/team/team';
import { CalendarComponent } from './pages/calendar/calendar';
import { SettingsComponent } from './pages/settings/settings';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {path:'login', component: LoginComponent},
    {path:'dashboard', component: DashboardComponent, canActivate: [authGuard]},
    { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
    { path: 'team', component: TeamComponent, canActivate: [authGuard] },
    { path: 'calendar', component: CalendarComponent, canActivate: [authGuard] },
    { path: 'settings', component: SettingsComponent, canActivate: [authGuard]},

    {path:'', redirectTo: 'login', pathMatch:'full'},

];
    