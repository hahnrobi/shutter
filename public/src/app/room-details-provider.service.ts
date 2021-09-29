import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Room } from './room/room';

@Injectable({
  providedIn: 'root'
})
export class RoomDetailsProviderService {
  apiUrl = 'http://dev.local:3000/rooms';
  private http:HttpClient;
  constructor(private _http: HttpClient) {
    this.http = _http;
    this.getConfig().subscribe(c => console.log(c));
  }
  getConfig() {
    return this.http.get<Room>(this.apiUrl+"/612cdb8f9f842e8c630802ff");
  }
}
