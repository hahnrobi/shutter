import { ConnectingDialogComponent } from './dialogs/connecting-dialog/connecting-dialog.component';
import { LastSpeakersService } from './last-speakers.service';
import { LocalInputProviderService } from './local-input-provider.service';
import { ISelfDataProvider } from './userdata/iself-data-provider';
import { SelfDataLocalStorageProvider } from './userdata/selfdata/self-data-local-storage-provider';
import { ReplaySubject, Observable } from 'rxjs';
import { ChatManagerService } from './chat/chat-manager.service';
import { ChatMessage } from './chat/chat-message';
import { UserManagerService } from './user-manager.service';
import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { User } from './user/user';
import { NbDialogService, NbToastRef } from '@nebular/theme';
import { NbToastrService, NbGlobalLogicalPosition, NbComponentStatus } from '@nebular/theme';

@Injectable({
  providedIn: 'root'
})
export class RoomManagerService {
  selfDataProvider:ISelfDataProvider;
  private dialogService:NbDialogService;

  constructor(private _connectionService:ConnectionService, private _userManagerService:UserManagerService, private _chatManagerService:ChatManagerService, private _lastSpeakersService:LastSpeakersService, private toastrService: NbToastrService, private _dialogService: NbDialogService) {
    this.selfDataProvider = new SelfDataLocalStorageProvider();
    this.dialogService = _dialogService;
    this._connectionService.selfDataProvier = this.selfDataProvider;
    this._userManagerService.setSelfDataProvider(this.selfDataProvider);
    
    console.log("%c[ROOM-MANAGER] ROOM MANAGER INIT", 'color: blue');
    this._connectionService.userJoinEvent.subscribe(user => {
      console.log("%c[ROOM-MANAGER] User joined: " + user.clientId, "color: green");
      this._userManagerService.addNewUserByObject(user, user.clientId==this._connectionService.clientId);
      //this._chatManagerService.broadcastMessage(user.name + " joined to room.");
      if(user.clientId!==this._connectionService.clientId) {
        this.toastrService.show(
          `Welcome ${ user.name } in the room.`,
          `${ user.name } joined.`,
          {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "success"});
      }
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

    this._connectionService.approvingUserJoined.subscribe(user => {
      this.toastrService.show(
        `${user.name} would like to join to the room.`,
        `Join request`,
        {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "info"});
    })


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

    this._connectionService.initDone.subscribe((v) => {
      if(v) {
        this._lastSpeakersService.init();
      }
    })
    this._lastSpeakersService.speakersList.subscribe(speakers => {
      console.log("Speaking speakers: ", speakers);
    })


  }
  public getUsers():Observable<User[]> {
    return this._userManagerService.getUsers();
  }
  public connectToRoom(roomId:string, service:LocalInputProviderService = null, password?:string):void {
    this._connectionService.startConnection(roomId, service, password);
  }
}
