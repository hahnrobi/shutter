import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthComponent } from './auth.component';
import { UserProfileEditorComponent } from './user-profile-editor/user-profile-editor.component';
import { LogoutComponent } from './logout/logout.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth-guard.service';
export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'logout',
        component: LogoutComponent,
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        component: UserProfileEditorComponent
      },
      {
        path: 'profile/password',
        canActivate: [AuthGuard],
        component: ChangePasswordComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
