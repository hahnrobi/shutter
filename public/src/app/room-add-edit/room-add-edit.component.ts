import { NbGlobalLogicalPosition, NbToastrService } from '@nebular/theme';
import { AuthService } from './../auth/auth.service';
import { RoomDetailsProviderService } from './../room-details-provider.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Room } from '../room/room';
import { RoomAddEditService } from './room-add-edit.service';
import { TranslatePipe } from '@ngx-translate/core';

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
  
  constructor(private addEditService:RoomAddEditService, private route: ActivatedRoute, private roomDetailsProviderService:RoomDetailsProviderService, private authService:AuthService, private toastrService:NbToastrService, private translatePipe:TranslatePipe) {
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
      this.addEditService.saveRoom(this.room, this.isNew).subscribe({
        next: (room) => {
          this.toastrService.show(
            this.translatePipe.transform('Your changes have been saved successfully.'),
            this.translatePipe.transform('Save successfull.'),
            {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "success"});
          this.submitted = false;
        },
        error: (err) => {
          this.toastrService.show(
            this.translatePipe.transform(err.error),
            this.translatePipe.transform('Cannot save room.'),
            {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
          console.error("", err);
          this.submitted = false;
        }

      });
    
  }


}
