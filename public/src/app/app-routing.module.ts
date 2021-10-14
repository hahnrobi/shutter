import { RoomComponent } from './room/room.component';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';

const routes: Routes = [
  {
    path: 'room',
    loadChildren: './room/room.module#RoomModule'
  },
  {
    path: 'auth',
    loadChildren: './auth/auth.module#AuthModule'
  },
  {path: "", component: AppComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    TranslateModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
