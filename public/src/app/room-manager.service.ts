import { LocalInputProviderService } from './local-input-provider.service';
import { ISelfDataProvider } from './room/userdata/iself-data-provider';
import { SelfDataLocalStorageProvider } from './room/userdata/selfdata/self-data-local-storage-provider';
import { ReplaySubject, Observable } from 'rxjs';
import { ChatManagerService } from './room/chat/chat-manager.service';
import { ChatMessage } from './room/chat/chat-message';
import { UserManagerService } from './user-manager.service';
import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { User } from './room/user/user';
import { NbToastRef } from '@nebular/theme';
import { NbToastrService, NbGlobalLogicalPosition, NbComponentStatus } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class RoomManagerService {
  selfDataProvider:ISelfDataProvider;


  constructor(private _connectionService:ConnectionService, private _userManagerService:UserManagerService, private _chatManagerService:ChatManagerService, private toastrService: NbToastrService) {
    this.selfDataProvider = new SelfDataLocalStorageProvider();
    this._connectionService.selfDataProvier = this.selfDataProvider;
    this._userManagerService.setSelfDataProvider(this.selfDataProvider);
    
    console.log("%c[ROOM-MANAGER] ROOM MANAGER INIT", 'color: blue');
    this._connectionService.userJoinEvent.subscribe(value => {
      console.log("%c[ROOM-MANAGER] User joined: " + value, "color: green");
      this._userManagerService.addNewUser(value, value==this._connectionService.clientId);
      this._chatManagerService.broadcastMessage("User joined to room.");
    });
    this._connectionService.userLeaveEvent.subscribe(value => {
      console.log("%c[ROOM-MANAGER] User left: " + value, "color: orange");
      this._chatManagerService.broadcastMessage(this._userManagerService.getUserByClientId(value).name + " left the room.");
      this.toastrService.show(
        `${this._userManagerService.getUserByClientId(value).name} left the room.`,
        `${this._userManagerService.getUserByClientId(value).name} left.`,
        {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
      this._userManagerService.removeUser(value);
    });

    this._connectionService.incomingStreamEvent.subscribe(tuple => {
      console.log("%c[ROOM-MANAGER] Incoming stream: " + tuple[0], "color: green");
      this._userManagerService.assignVideo(tuple[0], tuple[1]);
      this._connectionService.broadcastMyStatus();
      this._connectionService.broadcastMySelfData();
    })

    this._connectionService.statusChanged.subscribe(tuple => {
      console.log("[ROOM-MANAGER] Status changed: " + tuple[0]);
      this._userManagerService.updateStatus(tuple[0], tuple[1]);
    })
    this._connectionService.userDataIncoming.subscribe(tuple => {
      console.log("[ROOM-MANAGER] User data received: " + tuple[0]);
      this._userManagerService.updateData(tuple[0], tuple[1]);
    })

    this._connectionService.receiveMessage.subscribe(tuple => {
      console.log("[ROOM-MANAGER] Message received: " + tuple[1]);
      let user = this._userManagerService.getUserByClientId(tuple[0]);
      if(user != null) {
        this._chatManagerService.addMessage(tuple[1]);
        console.log(this._userManagerService.getUsersDirect());
      }else {
        console.error("[ROOM-MANAGER] Unknown user clientId: " + tuple[0]);
      }

    })

    this._chatManagerService.tryToSendMessage.subscribe(msg => {
      console.log("[ROOM-MANAGER] Message sending: " + msg.message);
      let user = this._userManagerService.getUserByClientId(this._connectionService.clientId);
      if(user != null) {
        msg.sender = user;
        this._chatManagerService.addMessage(msg);
        this._connectionService.sendMessage(msg);
      }else {
        console.error("[ROOM-MANAGER] Unknown user");
      }

    })


  }
  public getUsers():Observable<User[]> {
    return this._userManagerService.getUsers();
  }
  public connectToRoom(service:LocalInputProviderService = null):void {
    this._connectionService.startConnection(service);
  }
}
