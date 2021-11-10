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
import { TranslateService } from '@ngx-translate/core';

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

  public roomId:string;


  public connect_ask_to_password = false;

  roomDetailsProviderService:RoomDetailsProviderService;

  private iterableDiffer : any;
  private subs: Subscription[] = []

  currentState:"welcome"|"connecting"|"room" = "welcome";

  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;

  viewChangeMenuItems = [
    { title: 'Gallery', icon: "camera-outline", target: "galleryView" },
    { title: 'Spotlight', icon: "crop-outline", target: "spotlightView" }];

  constructor(private _roomDetailsProvider:RoomDetailsProviderService, private _roomManagerSerivce:RoomManagerService, private _connectionService:ConnectionService, private iterableDiffers: IterableDiffers, private route: ActivatedRoute, private toastrService:NbToastrService, private translate: TranslateService, private router:Router) {
    console.log("ROOM COMPONENT INIT")
    this.iterableDiffer = iterableDiffers.find([]).create(null);
    this.roomDetailsProviderService = _roomDetailsProvider;
    route.params.subscribe(p => {this.roomId = p.room;});
    this.connectionReply = this._connectionService.connectionStatusChanged;
    this._connectionService.connectionStatusChanged.subscribe(connectionInitReply => {
      if(connectionInitReply.result == "successful") {
        this.currentState = "room";
      }else {
        if(connectionInitReply.reason == "wrong_password") {
          
        }
        if(this.currentState == "room") {
          this.currentState = "welcome";
        }
      }
    })
  }


  ngOnInit(): void {
    const sub = this._roomManagerSerivce.getUsers().subscribe(data => {this.users = data});
    this.subs.push(sub);
  }

  public viewChange(view) {
    console.log("view changed: ", view);
    if(view === "gallery" || view === "spotlight") {
      this.view = view;
    }
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
          'Really want to exit?',
          `Please tap again to conform.`,
          {limit: 1, position: NbGlobalLogicalPosition.BOTTOM_START, status: "info"});
        this.leaveRoomTries++;
    } else {
      this._connectionService.disconnect();
      this.leaveRoomTries = 0;
      this.router.navigate(['/']);
    }
    
  }


  ngOnDestroy(){
    this._connectionService.disconnect();
    for( const sub of this.subs){
      if(sub){
        try{
          sub.unsubscribe();
        } catch {}
      }
    }
  }
}
