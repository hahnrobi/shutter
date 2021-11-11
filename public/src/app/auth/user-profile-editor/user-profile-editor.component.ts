import { RoomDetailsProviderService } from './../../room-details-provider.service';
import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { Room } from 'src/app/room/room';

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
    authService: AuthService,
    private roomDetailsProviderService: RoomDetailsProviderService
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
    console.log('save');
    this.submitted = true;
  }
}
