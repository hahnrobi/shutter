import { Injectable } from '@angular/core';
import { getDeepFromObject, NbAuthJWTToken, NbAuthService, NbAuthToken } from '@nebular/auth';
import { Observable, ReplaySubject } from 'rxjs';
import { User } from './user';
import {HttpClient, HttpHeaders} from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token:NbAuthJWTToken;
  private http:HttpClient;
  user:User;
  $user:ReplaySubject<User>;
  $isLoggedIn:ReplaySubject<boolean>;
  getToken:ReplaySubject<NbAuthJWTToken>;
  constructor(private authService: NbAuthService, private _http:HttpClient) {
    this.http = _http;
    this.$isLoggedIn = new ReplaySubject<boolean>();
    this.$user = new ReplaySubject<User>();
    this.getToken = new ReplaySubject<NbAuthJWTToken>();
    this.authService.onTokenChange()
      .subscribe({
        error: error => {alert("error"); this.$isLoggedIn.next(false);},
        next: (token: NbAuthToken) => {
          console.log("Token change: ", token);
          if(token instanceof NbAuthJWTToken) {
            this.token = token;
            this.getToken.next(token);
            if (token.isValid()) {
              console.log(token.getValue());
              this.$isLoggedIn.next(true);
              this.getLoggedInUser().subscribe({
                next: (user:User) => { 
                  this.user = user;
                  this.$user.next(user);
                  console.log(user);
                },
                error: (err) => {
                  console.log(err);
                  this.$isLoggedIn.next(false);
                }
             });
            }else {
              this.$isLoggedIn.next(false);
            }
          }else {
            this.$isLoggedIn.next(false);
          }
        },
        complete: () => console.log("complete")
      });
        
  }
  getTokenSync() {
    return this.token;
  }
  getLoggedInUser() {
    const reqHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token.getValue()}`
    })
    return this.http.get<User>('/api/user-me/', { headers: reqHeaders });
  }
}
