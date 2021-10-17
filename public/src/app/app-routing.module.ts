import { WelcomeComponent } from './welcome/welcome.component';
import { RoomComponent } from './room/room.component';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import { AuthGuard } from './auth/auth-guard.service';

const routes: Routes = [
  {path: "", component: WelcomeComponent},
  {
    path: 'room',
    loadChildren: './room/room.module#RoomModule'
  },
  {
    path: 'room-manage',
    canActivate: [AuthGuard],
    loadChildren: './room-add-edit/room-add-edit.module#RoomAddEditModule'
  },
  {
    path: 'auth',
    loadChildren: './auth/auth.module#AuthModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    TranslateModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
