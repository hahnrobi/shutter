import { RoomRoutingModule } from './room-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomComponent } from './room.component';
import { VideoelementComponent } from './videoelement/videoelement.component';
import { ChatDisplayComponent } from './chat/chat-display/chat-display.component';
import { WelcomeDialogComponent } from './dialogs/welcome-dialog/welcome-dialog.component';
import { UserListComponent } from './user-list/user-list.component';
import { LayoutSelectorComponent } from './layout-selector/layout-selector.component';
import { LayoutGalleryComponent } from './layouts/layout-gallery/layout-gallery.component';
import { LayoutSpotlightComponent } from './layouts/layout-spotlight/layout-spotlight.component';
import { ConnectingDialogComponent } from './dialogs/connecting-dialog/connecting-dialog.component';
import { WaitingListComponent } from './user-list/waiting-list/waiting-list.component';
import { WaitingUserComponent } from './user-list/waiting-list/waiting-user/waiting-user.component';
import { NbButtonModule, NbCardModule, NbChatModule, NbContextMenuModule, NbDialogModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbMenuModule, NbMenuService, NbSelectModule, NbThemeModule, NbToastrModule, NbToggleModule, NbTooltipModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { ConnectionService } from './connection.service';
import { UserManagerService } from './user-manager.service';
import { RoomManagerService } from './room-manager.service';
import { LocalInputProviderService } from './local-input-provider.service';
import { LastSpeakersService } from './last-speakers.service';
import { TranslateCompiler, TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';


export function HttpLoaderFactory(http:HttpClient) {
  return new TranslateHttpLoader(http);
}


@NgModule({
  declarations: [
    RoomComponent,
    VideoelementComponent,
    ChatDisplayComponent,
    WelcomeDialogComponent,
    UserListComponent,
    LayoutSelectorComponent,
    LayoutGalleryComponent,
    LayoutSpotlightComponent,
    ConnectingDialogComponent,
    WaitingListComponent,
    WaitingUserComponent
    ],
  imports: [
    RoomRoutingModule,
    HttpClientModule,
    CommonModule,
    NbEvaIconsModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbContextMenuModule,
    NbInputModule,
    FontAwesomeModule,
    FormsModule,
    NbTooltipModule,
    NbCardModule,
    NbChatModule,
    NbToggleModule,
    NbSelectModule,
    NbToastrModule,
    //NbMenuModule.forRoot(),
    TranslateModule.forChild(),
    //NbDialogModule.forChild(),
  ],
  exports: [
    RoomComponent,
    VideoelementComponent,
    ChatDisplayComponent,
    WelcomeDialogComponent,
    UserListComponent,
    LayoutSelectorComponent,
    LayoutGalleryComponent,
    LayoutSpotlightComponent,
    ConnectingDialogComponent,
    WaitingListComponent,
    WaitingUserComponent,
  ],
  providers: [ConnectionService, UserManagerService, RoomManagerService, NbMenuService, LocalInputProviderService, LastSpeakersService ],
})
export class RoomModule { }
