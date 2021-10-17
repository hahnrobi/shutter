import { AuthService } from './../auth/auth.service';
import { RoomDetailsProviderService } from './../room-details-provider.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Room } from '../room/room';
import { RoomAddEditService } from './room-add-edit.service';

@Component({
  selector: 'app-room-add-edit',
  templateUrl: './room-add-edit.component.html',
  styleUrls: ['./room-add-edit.component.scss']
})
export class RoomAddEditComponent implements OnInit {

  public room:Room;
  public submitted:boolean = false;
  public errors:string[];
  public isNew:boolean = true;
  public allowedToEdit = true;

  public authTypesList = [
   "approve",
   "password",
   "none"
  ]
  
  constructor(private addEditService:RoomAddEditService, private route: ActivatedRoute, private roomDetailsProviderService:RoomDetailsProviderService, private authService:AuthService) {
    this.room = new Room();
    route.params.subscribe(p => {
      console.log(p);
      if(p.room && p.room != "") {
        console.log("Room is: ", p.room);
        roomDetailsProviderService.getRoom(p.room).subscribe({
          error: () => {console.log("Invalid room"); this.isNew = true; this.room = new Room();},
          next: (room) => {
            if(room != null) {
              this.room = room;
              this.isNew = false;
              authService.$user.subscribe((u) => {
                this.allowedToEdit = room?.owner?._id == u._id;
              })
            }

          }
        })
      }
    });
  }

  

  ngOnInit(): void {
  }
  async save() {
    this.submitted = true;
    console.log(this.room);
    if(this.validateForm()) {
      this.addEditService.saveRoom(this.room, this.isNew);
    }
    this.submitted = false;
  }

  validateForm() {
    this.errors = [];
    if(!this.room.name || this.room.name.length < 1) {
      this.errors.push("Name required");
    }
    if(this.room.auth_type == "password" && (!this.room.auth_password || this.room.auth_password == "")) {
      this.errors.push("Password required");
    }
    return this.errors.length == 0;
  }

}
