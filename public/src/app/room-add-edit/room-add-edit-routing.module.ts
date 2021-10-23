import { RoomDeleteConfirmComponent } from './room-delete-confirm/room-delete-confirm.component';
import { RoomAddEditComponent } from './room-add-edit.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
      {
        path: ':room',
        component: RoomAddEditComponent,
      },
      {
        path: 'delete/:room',
        component: RoomDeleteConfirmComponent
      },
      {
        path: '',
        component: RoomAddEditComponent,
      }


];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomAddEditRoutingModule { }
