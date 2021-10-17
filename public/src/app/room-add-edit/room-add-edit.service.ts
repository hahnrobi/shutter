import { AuthService } from './../auth/auth.service';
import { Injectable } from '@angular/core';
import { Room } from '../room/room';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomAddEditService {

  constructor(private authService: AuthService, private http:HttpClient) { }
  async saveRoom(room:Room, isNew = false) {
    this.authService.$isLoggedIn.subscribe((isLoggedIn) => {
      if(isLoggedIn) {
        if(isNew) {
          console.log("Adding new room...");
          return this.addNewRoom(room);
        }else {
          console.log("Updating room...");
          return this.updateRoom(room);
        }
      }else {
        return false;
      }
    })
  }
  private addNewRoom(room:Room) {
    const reqHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getTokenSync().getValue()}`
    })
    console.log("adding...");
    return this.http.post<Room>('/api/rooms/', room, { headers: reqHeaders }).subscribe((w) => console.log(w));
  }
  private updateRoom(room:Room) {

  }
}
