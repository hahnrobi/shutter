import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NbAlertModule, NbButton, NbButtonModule, NbInputModule, NbRadioComponent, NbRadioModule } from '@nebular/theme';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoomAddEditRoutingModule } from './room-add-edit-routing.module';
import { RoomAddEditComponent } from './room-add-edit.component';


@NgModule({
  declarations: [
    RoomAddEditComponent
  ],
  imports: [
    CommonModule,
    NbAlertModule,
    NbInputModule,
    NbRadioModule,
    NbButtonModule,
    FormsModule,
    TranslateModule,
    RoomAddEditRoutingModule
  ],
  providers: [
    TranslatePipe
  ]
})
export class RoomAddEditModule { }
