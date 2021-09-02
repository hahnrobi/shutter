import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { ConnectionService } from './connection.service';
import { UserManagerService } from './user-manager.service';
import { RoomManagerService } from './room-manager.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoomComponent } from './room/room.component';
import { VideoelementComponent } from './room/videoelement/videoelement.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbButtonModule, NbIconModule, NbInputModule, NbDialogModule, NbToastrModule, NbContextMenuModule, NbMenuService, NbMenuModule, NbTooltipModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChatDisplayComponent } from './room/chat/chat-display/chat-display.component';
import { FormsModule } from '@angular/forms';
import { WelcomeDialogComponent } from './room/welcome-dialog/welcome-dialog.component';
import { UserListComponent } from './room/user-list/user-list.component';


@NgModule({
  declarations: [
    AppComponent,
    RoomComponent,
    VideoelementComponent,
    ChatDisplayComponent,
    WelcomeDialogComponent,
    UserListComponent,
    ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'dark' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbButtonModule,
    NbIconModule,
    NbContextMenuModule,
    NbInputModule,
    FontAwesomeModule,
    FormsModule,
    NbTooltipModule,
    NbDialogModule.forRoot(),
    NbToastrModule.forRoot(),
    NbMenuModule.forRoot()
  ],
  providers: [ConnectionService, UserManagerService, RoomManagerService, NbMenuService],
  bootstrap: [AppComponent]
})
export class AppModule { }
