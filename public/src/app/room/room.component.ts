import { LocalInputProviderService } from './../local-input-provider.service';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';
import { ConnectionService } from './../connection.service';
import { Component, ElementRef, EventEmitter, HostListener, IterableDiffers, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { RoomManagerService } from '../room-manager.service';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { User } from './user/user';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.5s ease-out', style({ opacity: '1' })),
      ]),
    ]),
  ],
})
export class RoomComponent implements OnInit {
  @ViewChild('videoGrid') videoGrid:ElementRef;
  @ViewChildren('videoFrame') videoFrames:QueryList<any>;
  @Output() mutedAudioEvent = new EventEmitter<boolean>();
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(this.view === "gallery") {
      this.resizeVideoFrames()
    }
  }
  public users = [];
  public view:"gallery"|"spotlight" = "gallery";

  private iterableDiffer : any;
  private subs: Subscription[] = []

  isUserInitialized:boolean = false;

  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;

  viewChangeMenuItems = [
    { title: 'Gallery', icon: "camera-outline", target: "galleryView" },
    { title: 'Spotlight', icon: "crop-outline", target: "spotlightView" }];

  constructor(private _roomManagerSerivce:RoomManagerService, private _connectionService:ConnectionService, private iterableDiffers: IterableDiffers) {
    this.iterableDiffer = iterableDiffers.find([]).create(null);
  }

  ngDoCheck() {
    if(this.view === "gallery") {
      let changes = this.iterableDiffer.diff(this.users);
      if (changes) {
        this.resizeVideoFrames();
      }

      changes = this.iterableDiffer.diff(this.videoGrid?.nativeElement?.childNodes);
      if (changes) {
        this.resizeVideoFrames();
      }
    }
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
    this.isUserInitialized = true;
  }
  public connectToRoom(service:LocalInputProviderService) {
    this._roomManagerSerivce.connectToRoom(service);
  }
  public testAddVideoBox() {
    let user = new User();
    user.name = "Test";
    this.users.push(user);
  }
  public testResize() {
    this.resizeVideoFrames();
  }

  private Area(Increment, Count, Width, Height, Margin = 10) {
    let w = 0;
    let i = 0;
    let h = Increment * 0.75 + (Margin * 2);
    while (i < (Count)) {
        if ((w + Increment) > Width) {
            w = 0;
            h = h + (Increment * 0.75) + (Margin * 2);
        }
        w = w + Increment + (Margin * 2);
        i++;
    }
    if (h > Height) return false;
    else return Increment;
  }
  private setWidth(width, margin) {
    this.videoFrames.toArray().forEach(camera => {
      camera.nativeElement.style.width = width + "px";
      camera.nativeElement.style.margin = margin + "px";
      camera.nativeElement.style.height = (width * 0.75) +"px";
    })
  }
  private resizeVideoFrames() {
    // variables:
        let Margin = 2;
        let Width = this.videoGrid.nativeElement.offsetWidth - (Margin * 2);
        let Height = this.videoGrid.nativeElement.offsetHeight - (Margin * 2);
        let max = 0;
        console.log(Width)
        console.log(Height)
    
    // loop (i recommend you optimize this)
        let i = 1;
        while (i < 5000) {
            let w = this.Area(i, this.videoFrames.length, Width, Height, Margin);
            if (w === false) {
                max =  i - 1;
                break;
            }
            i++;
        }
    
    // set styles
        max = max - (Margin * 2);
        this.setWidth(max, Margin);
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
