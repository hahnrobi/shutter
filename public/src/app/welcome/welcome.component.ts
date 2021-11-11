import { RoomDetailsProviderService } from './../room-details-provider.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  rooms = [];
  roomsLoaded = false;
  roomsSub = null;

  constructor(private roomDetailsProviderService: RoomDetailsProviderService) { }

  ngOnInit(): void {
    this.roomsSub = this.roomDetailsProviderService
      .getPublicRooms()
      .subscribe((rooms) => {this.rooms = rooms; this.roomsLoaded = true});
  }

  ngOnDestroy(): void {
    this.roomsSub?.unsubscribe();
  }
}
