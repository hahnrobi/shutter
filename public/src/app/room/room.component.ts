import { ConnectionInitReply } from './connection-init-reply';
import { RoomDetailsProviderService } from './../room-details-provider.service';
import { LocalInputProviderService } from './../local-input-provider.service';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';
import { ConnectionService } from './../connection.service';
import { Component, ElementRef, EventEmitter, HostListener, IterableDiffers, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { RoomManagerService } from '../room-manager.service';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { ReplaySubject, Subscription } from 'rxjs';
import { User } from './user/user';
import { ActivatedRoute } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  @Output() mutedAudioEvent = new EventEmitter<boolean>();

  public users = [];
  public view:"gallery"|"spotlight" = "gallery";
  public connectionReply:ReplaySubject<ConnectionInitReply>;

  public roomId:string;



  roomDetailsProviderService:RoomDetailsProviderService;

  private iterableDiffer : any;
  private subs: Subscription[] = []

  currentState:"welcome"|"connecting"|"room" = "welcome";

  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;

  viewChangeMenuItems = [
    { title: 'Gallery', icon: "camera-outline", target: "galleryView" },
    { title: 'Spotlight', icon: "crop-outline", target: "spotlightView" }];

  constructor(private _roomDetailsProvider:RoomDetailsProviderService, private _roomManagerSerivce:RoomManagerService, private _connectionService:ConnectionService, private iterableDiffers: IterableDiffers, private route: ActivatedRoute) {
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
  public connectToRoom(service:LocalInputProviderService) {
    this._roomManagerSerivce.connectToRoom(this.roomId, service);
    this.currentState = "connecting";
  }

  public testAddVideoBox() {
    let user = new User();
    user.name = "Test";
    this.users.push(user);
  }


  ngOnDestroy(){
    for( const sub of this.subs){
      if(sub){
        try{
          sub.unsubscribe();
        } catch {}
      }
    }
  }
}
