import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Room } from './room/room';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoomDetailsProviderService {
  apiUrl = '/api/rooms';
  private http: HttpClient;
  constructor(private _http: HttpClient) {
    this.http = _http;
  }
  getRoom(roomId) {
    return this.http.get<Room>(this.apiUrl + '/' + roomId).pipe(catchError((err:HttpErrorResponse) => {
      return of(null);
    }));
  }
}
