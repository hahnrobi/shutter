import { RoomAddEditService } from './../room-add-edit.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Location} from '@angular/common';

@Component({
  selector: 'app-room-delete-confirm',
  templateUrl: './room-delete-confirm.component.html',
  styleUrls: ['./room-delete-confirm.component.scss']
})
export class RoomDeleteConfirmComponent implements OnInit {

  roomId = undefined;

  constructor(private roomAddEditService:RoomAddEditService, private activeRoute:ActivatedRoute, private _location: Location, private router:Router) {
    activeRoute.params.subscribe(p => {
      if(p.room && p.room != "") {
        this.roomId = p.room;
      }
    });
  }

  ngOnInit(): void {
  }

  yes() {
    this.roomAddEditService.deleteRoom(this.roomId);
    this.router.navigate(['auth/profile']);
  }
  no() {
    this._location.back();
  }
}
