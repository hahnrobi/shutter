import { AuthService } from './auth/auth.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Room } from './room/room';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoomDetailsProviderService {
  apiUrl = '/api';
  private http: HttpClient;
  constructor(private _http: HttpClient, private authService:AuthService) {
    this.http = _http;
  }
  getRoom(roomId) {
    return this.http.get<Room>(this.apiUrl + '/rooms/' + roomId).pipe(catchError((err:HttpErrorResponse) => {
      return of(null);
    }));
  }
  getPublicRooms() {
    return this.http.get<Room[]>(this.apiUrl + '/rooms').pipe(catchError((err:HttpErrorResponse) => {
      return of(null);
    }));
  }
  getRoomsForCurrentUser() {
    const reqHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getTokenSync().getValue()}`
    })
    return this.http.get<Room[]>(this.apiUrl + '/rooms-self/', {headers: reqHeaders}).pipe(catchError((err:HttpErrorResponse) => {
      return of(null);
    }));
  }
}
