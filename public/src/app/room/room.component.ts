import { UserManagerService } from './user-manager.service';
import { NbDialogService, NbGlobalLogicalPosition, NbToastrService } from '@nebular/theme';
import { ConnectionInitReply } from './connection-init-reply';
import { RoomDetailsProviderService } from './../room-details-provider.service';
import { LocalInputProviderService } from './local-input-provider.service';
import { WelcomeDialogComponent } from './dialogs/welcome-dialog/welcome-dialog.component';
import { ConnectionService } from './connection.service';
import { Component, ElementRef, EventEmitter, HostListener, IterableDiffers, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { RoomManagerService } from './room-manager.service';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { User } from './user/user';
import { ActivatedRoute, Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return this.currentState != "room";
  }
  @Output() mutedAudioEvent = new EventEmitter<boolean>();

  public users = [];
  public view:"gallery"|"spotlight" = "gallery";
  public connectionReply:ReplaySubject<ConnectionInitReply>;

  public localInputProviderService:LocalInputProviderService;

  public isSpectator:boolean = false;
  public roomId:string;
  public roomActiveContainer: "room"|"users"|"chat" = "room";


  public connect_ask_to_password = false;

  roomDetailsProviderService:RoomDetailsProviderService;

  private subs: Subscription[] = []

  currentState:"welcome"|"connecting"|"room" = "welcome";

  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;

  viewChangeMenuItems = [
    { title: 'Gallery', icon: "camera-outline", target: "galleryView" },
    { title: 'Spotlight', icon: "crop-outline", target: "spotlightView" }];

  constructor(
    private _roomDetailsProvider:RoomDetailsProviderService,
    private _roomManagerSerivce:RoomManagerService,
    private _connectionService:ConnectionService,
    private _userManagerService:UserManagerService,
    private iterableDiffers: IterableDiffers,
    private route: ActivatedRoute,
    private toastrService:NbToastrService,
    private translate: TranslatePipe,
    private router:Router ) {
    console.log("ROOM COMPONENT INIT")
    this.roomDetailsProviderService = _roomDetailsProvider;
    route.params.subscribe(p => {this.roomId = p.room;});
    this.connectionReply = this._connectionService.connectionStatusChanged;
    this._connectionService.connectionStatusChanged.subscribe(connectionInitReply => {
      if(connectionInitReply.result == "successful") {
        this.currentState = "room";
      }else {
        if(this.currentState == "room") {
          this.currentState = "welcome";
        }
      }
      if(connectionInitReply.result == "failed" && connectionInitReply.reason == "wrong_password") {
          this._connectionService.leave();
          this.toastrService.show(
            this.translate.transform("The entered password is wrong. Please try again."),
            this.translate.transform("Wrong password"),
            {limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status: "danger"});
          this.currentState = "welcome";
      }
    })
  }


  ngOnInit(): void {
    const sub = this._roomManagerSerivce.getUsers().subscribe(data => {
      this.users = data
    });
    this.subs.push(sub);
  }

  public viewChange(view) {
    console.log("view changed: ", view);
    if(view === "gallery" || view === "spotlight") {
      this.view = view;
    }
  }

  public micAvailable() {
    return this._connectionService.selfStreamProvider.isAudioAvailable();
  }
  public webcamAvailable() {
    return this._connectionService.selfStreamProvider.isVideoAvailable();
  }

  public muteMyAudio() {
    this._connectionService.selfStreamProvider?.muteStream();
    this._connectionService.updateMicMuteStatus(true);
  }
  public unMuteMyAudio() {
    this._connectionService.selfStreamProvider?.unMuteStream();
    this._connectionService.updateMicMuteStatus(false);
  }
  public isMyAudioMuted() {
    return this._connectionService.selfStreamProvider?.isAudioMuted();
  }

  public turnOffMyWebcam() {
    this._connectionService.selfStreamProvider?.turnOffCamera();
    this._connectionService.updateVideoMuteStatus(true);
  }
  public turnOnMyWebcam() {
    this._connectionService.selfStreamProvider?.turnOnCamera();
    this._connectionService.updateVideoMuteStatus(false);
  }
  public isMyWebcamOn() {
    return this._connectionService.selfStreamProvider?.isWebcamOn();
  }
  public setMyName(name:string) {
    this._roomManagerSerivce.selfDataProvider.setName(name);
  }
  


  public finalizeConfiguration(inputService:LocalInputProviderService) {
    if(inputService != null) {
      this.localInputProviderService = inputService;
      if(inputService.currentAudioInput === null && inputService.currentVideoInput === null) {
        this.isSpectator = true;
      }
      this.currentState = "connecting";
      this.roomDetailsProviderService.getRoom(this.roomId).subscribe(room => {
        if(room?.auth_type == "password") {
          this.connect_ask_to_password = true;
        }else {
          this.connectToRoom();
        }
      })
    }
  }
  public connectWithPassword(password) {
    console.log("Connecting with password: ", password);
    this._roomManagerSerivce.connectToRoom(this.roomId, this.localInputProviderService, password);
  }
  public connectToRoom() {
    this._roomManagerSerivce.connectToRoom(this.roomId, this.localInputProviderService);
    
  }

  public testAddVideoBox() {
    let user = new User();
    user.name = "Test";
    this.users.push(user);
  }

  private leaveRoomTries = 0;
  public leaveRoom() {
    if(this.leaveRoomTries == 0) {
        this.toastrService.show(
          this.translate.transform('Really want to exit?'),
          this.translate.transform('Please tap again to confirm.'),
          {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "info"});
        this.leaveRoomTries++;
    } else {
      this._connectionService.leave();
      this.leaveRoomTries = 0;
      this.router.navigate(['/']);
    }
    
  }
  public changeActiveContainer(item) {
    console.log("changed view: ", item);
    this.roomActiveContainer = item;
  }


  ngOnDestroy(){
    if(this.currentState == "room") {
      this._connectionService.leave();
    }
    for( const sub of this.subs){
      if(sub){
        try{
          sub.unsubscribe();
        } catch {}
      }
    }
  }
}
