import { FormsModule } from '@angular/forms';
import { NbAlertModule, NbCheckboxModule, NbInputModule, NbButtonModule, NbIconModule, NbTooltipModule, NbToastrModule, NbThemeModule, NbLayoutModule, NbCardComponent, NbCardModule } from '@nebular/theme';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbPasswordAuthStrategy,
  NbAuthModule,
  NbAuthJWTToken,
} from '@nebular/auth';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { UserTopMenuComponent } from './user-top-menu/user-top-menu.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { LogoutComponent } from './logout/logout.component';
import { RegisterComponent } from './register/register.component';
import { UserProfileEditorComponent } from './user-profile-editor/user-profile-editor.component';
import { ListRoomsComponent } from './list-rooms/list-rooms.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AuthComponent } from './auth.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
export function HttpLoaderFactory(http:HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  declarations: [LoginComponent, UserTopMenuComponent, LogoutComponent, RegisterComponent, UserProfileEditorComponent, ListRoomsComponent, AuthComponent, ChangePasswordComponent],
  imports: [
    CommonModule,
    TranslateModule,
    NbAlertModule,
    NbCheckboxModule,
    NbInputModule,
    NbButtonModule,
    FormsModule,
    NbButtonModule,
    NbEvaIconsModule,
    NbTooltipModule,
    NbCardModule,
    NbIconModule,

    AuthRoutingModule,
    NbAuthModule.forRoot({
      strategies: [
        NbPasswordAuthStrategy.setup({
          name: 'email',
          baseEndpoint: '/api/',
          token: {
            class: NbAuthJWTToken,
            key: 'token',
          },
          login: {
            endpoint: 'auth/login',
          },
          logout: {
            endpoint: 'auth/logout'
          },
          register: {
            endpoint: 'user',
          },
        }),
      ],
      forms: {
        login: {
          redirectDelay: 3000,
          strategy: 'email',
          showMessages: {
            success: true,
            error: true,
          },
        },
        register: {
          redirectDelay: 500,
          strategy: 'email',
          showMessages: {
            success: true,
            error: true,
          }
        },
        logout: {
          redirectDelay: 500,
          strategy: 'email',
          requireValidToken: false,
        },
        validation: {
          password: {
            required: true,
            minLength: 4,
            maxLength: 50,
          },
          email: {
            required: true,
          },
          name: {
            required: true,
            minLength: 4,
            maxLength: 50,
          },
        },
      },
    }),
  ],
  exports: [UserTopMenuComponent],
  providers: [OverlayContainer, NbThemeModule.forRoot({ name: 'dark' }).providers]
})
export class AuthModule {}
