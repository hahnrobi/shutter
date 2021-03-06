import { TranslatePipe } from '@ngx-translate/core';
import { RoomDetailsProviderService } from './../room-details-provider.service';
import { HeaderTitleService } from './../header-title-service';
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
import { first, take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class RoomManagerService {
  selfDataProvider:ISelfDataProvider;
  private dialogService:NbDialogService;
  private isConnectionServiceInitialized = false;

  constructor(private _connectionService:ConnectionService, private _userManagerService:UserManagerService, private _chatManagerService:ChatManagerService, private _lastSpeakersService:LastSpeakersService, private toastrService: NbToastrService, private _dialogService: NbDialogService, private headerTitleService:HeaderTitleService, private roomDetailsProvider:RoomDetailsProviderService, private translate:TranslatePipe) {
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
          this.translate.transform('Welcome') + " " + user.name + " " + this.translate.transform('in the room.'),
          user.name + " " + this.translate.transform('joined.'),
          {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "success"});
      }
    });
    this._connectionService.userLeaveEvent.subscribe(value => {
      console.log("%c[ROOM-MANAGER] User left: " + value, "color: orange");
      this._chatManagerService.broadcastMessage(this._userManagerService.getUserByClientId(value).name + " " + this.translate.transform("left the room."));
      this.toastrService.show(
        this._userManagerService.getUserByClientId(value).name + " " + this.translate.transform("left the room."),
        this._userManagerService.getUserByClientId(value).name + " " + this.translate.transform("left the room."),
        {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
      this._userManagerService.removeUser(value);
    });


    this._connectionService.approvingUserJoined.subscribe(user => {
      this.toastrService.show(
        user.name + " " + this.translate.transform("would like to join to the room."),
        this.translate.transform("Join request"),
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
        this._chatManagerService.addMessage(new ChatMessage(user,tuple[1]));
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

    this._connectionService.joinedToRoom.subscribe((id) => {
      console.log("[ROOM-MANAGER] Joined to room.");
      if(id) {
        _lastSpeakersService.init();
        this.roomDetailsProvider.getRoom(id).subscribe(room => {
          this.headerTitleService.joinedToRoom(room);
        })
        
      }
    })

    this._connectionService.leaveRoom.subscribe(() => {
      this._userManagerService.clear();
      this.headerTitleService.leftRoom();
    })

    this._connectionService.socketError.subscribe(value => {
      console.log("%c[ROOM-MANAGER] Socket error received: " + value, "color: red");
      this.toastrService.show(
        this.translate.transform(value),
        this.translate.transform("Error"),
        {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
    });



  }
  public getUsers():Observable<User[]> {
    return this._userManagerService.getUsers();
  }
  public connectToRoom(roomId:string, service:LocalInputProviderService = null, password?:string):void {
      this._connectionService.startConnection(roomId, service, password);
  }
}
