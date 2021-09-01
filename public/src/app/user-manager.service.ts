import { SelfDataTransfer } from './room/userdata/selfdata/self-data-transfer';
import { ISelfDataProvider } from './room/userdata/iself-data-provider';
import { UserStatus } from './room/user-status/user-status';
import { MediaStreamProvider } from './room/mediastreamprovider';
import { Injectable } from '@angular/core';
import { User } from './room/user/user';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagerService {
  private users:User[] = [];
  private me:string;
  private myName:string;

  private selfDataProvider:ISelfDataProvider;
  constructor() {

  }
  public addNewUser(clientId:string, self:boolean = false) {
    let u = new User();
    u.clientId = clientId;
    u.isMe=self;
    this.users[clientId] = u;
    this.me=clientId;
    if(self) {
      u.name = this.myName;
    }
    console.log(this.users);
  }
  public removeUser(clientId:string) {
    delete this.users[clientId];
  }
  public assignVideo(clientId:string, streamProvider:MediaStreamProvider) {
    console.log(this.users);
    let user = this.users[clientId];
    if(user == null || user == undefined) {
      user = new User();
      user.clientId = clientId;
      this.users[clientId] = user;
    }
    user.mediaStreamProvider = streamProvider;
  }
  public updateStatus(clientId:string, status:UserStatus) {
    let user = this.users[clientId];
    user.status = status;
  }
  public updateData(clientId:string, data:SelfDataTransfer) {
    let u:User = this.getUserByClientId(clientId);
    if(u != null) {
      u.name = data.name;
    }
  }
  public getUsers():Observable<User[]>{
    return of(this.users);
  }
  public getUsersDirect():User[] {
    return this.users;
  }
  public getUserByClientId(id:string):User {
    let user = this.users[id];
    if(!(user == null || user == undefined)) {
      return user;
    }
    return null;
  }
  public setSelfDataProvider(provider:ISelfDataProvider) {
    this.selfDataProvider = provider;
    this.selfDataProvider.nameUpdated.subscribe(name => {
      console.log("Updating my own name.");
      if(this.users[this.me] != undefined) {
        this.users[this.me].name = name;
      }
      this.myName = name;
    })
  }
}
