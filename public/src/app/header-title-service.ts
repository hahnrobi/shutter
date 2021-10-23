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
    console.log("RRR", room.name);
    this.title.next(room.name);
  }
  leftRoom() {
    this.title.next("Shutter");
  }
}
