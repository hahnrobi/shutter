import { AuthService } from './../auth/auth.service';
import { Injectable } from '@angular/core';
import { Room } from '../room/room';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomAddEditService {
  private isLoggedIn:boolean = false;


  constructor(private authService: AuthService, private http:HttpClient) {
    this.authService.$isLoggedIn.subscribe(isLoggedIn => this.isLoggedIn = isLoggedIn);
  }
  saveRoom(room:Room, isNew = false):Observable<Room> {
      if(this.isLoggedIn) {
        if(isNew) {
          console.log("Adding new room...");
          return this.addNewRoom(room);
        }else {
          console.log("Updating room...");
          return this.updateRoom(room);
        }
      }else {
        return undefined;
      }
  }
  private getBearerHeader():HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getTokenSync().getValue()}`
    })
  }
  private addNewRoom(room:Room) {
    const reqHeaders = this.getBearerHeader();
    console.log("adding...");
    return this.http.post<Room>('/api/rooms/', room, { headers: reqHeaders });
  }
  private updateRoom(room:Room) {
    const reqHeaders = this.getBearerHeader();
    console.log("updating...");
    return this.http.put<Room>('/api/rooms/'.concat(room._id), room, { headers: reqHeaders });
  }
  public async deleteRoom(roomId) {
    if(this.isLoggedIn) {
      const reqHeaders = this.getBearerHeader();
      this.http.delete<any>('/api/rooms/'.concat(roomId),{ headers: reqHeaders }).subscribe({
        next: () => {return true},
        error: () => {return false}
      });
    }else {
      return undefined;
    }
  }
}
