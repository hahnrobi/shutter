import { LeavingRoomGuardService } from './leaving-room-guard.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { RoomComponent } from './room.component';

const routes: Routes = [
  {
    path: ':room', component: RoomComponent, canDeactivate: [LeavingRoomGuardService]
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
  }
)

export class RoomRoutingModule { }
