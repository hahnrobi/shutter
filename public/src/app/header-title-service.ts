import { Room } from './room/room';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderTitleService {
  title:BehaviorSubject<string>;
  constructor() {
    this.title = new BehaviorSubject<string>("Shutter");
  }

  joinedToRoom(room:Room) {
    if(room != null) {
      this.title.next(room.name);
      document.title = room.name + " // Shutter";
    }
  }
  leftRoom() {
    this.title.next("Shutter");
    document.title = "Shutter";
  }
}
