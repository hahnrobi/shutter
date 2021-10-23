import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Room } from 'src/app/room/room';

@Component({
  selector: 'auth-list-rooms',
  templateUrl: './list-rooms.component.html',
  styleUrls: ['./list-rooms.component.scss']
})
export class ListRoomsComponent implements OnInit {

  constructor() { }

  @Input() rooms:Room[];
  ngOnInit(): void {
    console.log(this.rooms);
  }

}
