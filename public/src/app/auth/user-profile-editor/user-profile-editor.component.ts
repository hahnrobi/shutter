import { RoomDetailsProviderService } from './../../room-details-provider.service';
import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { Room } from 'src/app/room/room';
import { TranslatePipe } from '@ngx-translate/core';
import { NbGlobalLogicalPosition, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-user-profile-editor',
  templateUrl: './user-profile-editor.component.html',
  styleUrls: ['./user-profile-editor.component.scss'],
})
export class UserProfileEditorComponent implements OnInit {
  errors: string[];
  submitted = false;
  user: User = new User();
  rooms: Room[] = [];

  loaded: boolean = false;
  roomsLoaded: boolean = false;

  private subs: any[] = [];

  constructor(
    private authService: AuthService,
    private roomDetailsProviderService: RoomDetailsProviderService,
    private translate: TranslatePipe,
    private toastrService:NbToastrService
  ) {
    authService.getLoggedInUser().subscribe({
      error: () => {
        console.log('Invalid user');
        this.user = null;
        this.loaded = true;
        this.errors = ['User not exists. :('];
      },
      next: (user) => {
        this.loaded = true;
        if (user != null) {
          this.user = user;
        }
      },
    });
  }

  ngOnInit(): void {
    let sub = this.roomDetailsProviderService
      .getRoomsForCurrentUser()
      .subscribe((rooms) => {this.rooms = rooms; this.roomsLoaded = true});
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe);
  }
  save() {
    this.submitted = true;
    this.authService.updateUser(this.user).subscribe({
      next: (reply) => 
      {
        this.toastrService.show(
        this.translate.transform("Your details updated successfully."),
        this.translate.transform("Details updated"),
        {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "success"});
        this.submitted = false;
      },
      error: (err) =>
      {
        this.toastrService.show(
        this.translate.transform(err.error),
        this.translate.transform("Error"),
        {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"})
        this.submitted = false;
      }
    });
  }
}
