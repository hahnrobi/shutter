import { AuthGuard } from './auth/auth-guard.service';
import { RoomAddEditModule } from './room-add-edit/room-add-edit.module';
import { LocalizationProviderModule } from './localization-provider/localization-provider.module';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoomComponent } from './room/room.component';
import { VideoelementComponent } from './room/videoelement/videoelement.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbButtonModule, NbIconModule, NbInputModule, NbDialogModule, NbToastrModule, NbContextMenuModule, NbMenuService, NbMenuModule, NbTooltipModule, NbSelectModule, NbToggleModule, NbCardComponent, NbCardHeaderComponent, NbCardBodyComponent, NbCardFooterComponent, NbCardModule, NbFormFieldModule, NbCheckboxModule, NbAlertModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChatDisplayComponent } from './room/chat/chat-display/chat-display.component';
import { FormsModule } from '@angular/forms';
import { WelcomeDialogComponent } from './room/dialogs/welcome-dialog/welcome-dialog.component';
import { UserListComponent } from './room/user-list/user-list.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { LayoutSelectorComponent } from './room/layout-selector/layout-selector.component';
import { LayoutGalleryComponent } from './room/layouts/layout-gallery/layout-gallery.component';
import { LayoutSpotlightComponent } from './room/layouts/layout-spotlight/layout-spotlight.component';

import { ConnectingDialogComponent } from './room/dialogs/connecting-dialog/connecting-dialog.component';
import { WaitingListComponent } from './room/user-list/waiting-list/waiting-list.component';
import { WaitingUserComponent } from './room/user-list/waiting-list/waiting-user/waiting-user.component';

import {RoomModule} from './room/room.module';
import {AuthModule} from './auth/auth.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { RoomAddEditComponent } from './room-add-edit/room-add-edit.component';



@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    //RoomModule,
    LocalizationProviderModule,
    AuthModule,
    HttpClientModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'dark' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbCheckboxModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbContextMenuModule,
    NbInputModule,
    NbDialogModule.forRoot(),
    FontAwesomeModule,
    FormsModule,
    NbTooltipModule,
    NbCardModule,
    NbToggleModule,
    NbSelectModule,
    NbDialogModule.forRoot(),
    NbToastrModule.forRoot(),
    NbMenuModule.forRoot(),

  ],
  providers: [NbMenuService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
