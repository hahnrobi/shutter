import { faMicrophoneSlash, faThumbsDown, faEllipsisH, faUserSlash, faUser} from '@fortawesome/free-solid-svg-icons';
import { Component, ElementRef, Input,Inject, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { NB_WINDOW, NbMenuService } from '@nebular/theme';
import { User } from '../user/user';
import { Observable, timer } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { element } from 'protractor';


@Component({
  selector: 'app-videoelement',
  templateUrl: './videoelement.component.html',
  styleUrls: ['./videoelement.component.scss']
})
export class VideoelementComponent implements OnInit {
  @Input() user:User;
  @ViewChild('video') videoElement:ElementRef;
  everyFiveSeconds: Observable<number> = timer(0, 5000);
  time = null;
  videoSizing : "cover"|"contain" = "cover";
  faMicrophoneSlash = faMicrophoneSlash;
  faEllipsisH = faEllipsisH;
  faUserSlash = faUserSlash;

  contextMenuItems = [
   { title: 'Pin video', icon: "camera-outline", target: "pinVideo" },
   { title: 'Contain videos in frame', icon: "crop-outline", target: "toggleSizing" },
   { title: 'Cover videos in frame', icon: "expand-outline", target: "toggleSizing", hidden: true },
   { title: "Mute for me", icon: "slash-outline", target: "toggleMute" },
   { title: "Unmute audio", hidden: true, icon: "volume-up-outline", target: "toggleMute" }];

  constructor(private nbMenuService: NbMenuService, @Inject(NB_WINDOW) private window) {

  }

  ngOnInit(): void {
    this.time = this.everyFiveSeconds.subscribe(() => {
      let u = this.user;
      this.user = null;
      this.user=u;
    });

    this.contextMenuItems.forEach(element => {
      if(this.user.isMe) {
        if(element.target == 'toggleMute' || element.target == 'pinVideo') { element.hidden = true; }
      }
      
    });

    this.nbMenuService.onItemClick()
    .pipe(
      filter(({ tag }) => tag == 'videoframe-' + this.user.clientId),
    )
    .subscribe(bag => {
      let item = bag.item;
      let tag = bag.tag;

      switch(item.target) {
        case "toggleSizing":
          this.contextMenuItems.forEach(element => {
            if(element.target == 'toggleSizing') { element.hidden = false; }
          });
          if(this.videoSizing === "cover") {
            this.videoSizing = "contain";
          }else {
            this.videoSizing = "cover";
          }
          item.hidden = true;
          break;
        case "toggleMute": 
          this.contextMenuItems.forEach(element => {
            if(element.target == 'toggleMute') { element.hidden = false; }
          });
          item.hidden = true;
          this.user.locallyMuted = !this.user.locallyMuted;
          console.log(this.user.locallyMuted);
          break;
        case "pinVideo":
          this.user.locallyPinned = !this.user.locallyPinned;
          break;
        }
    });
  }
  ngAfterViewInit() {
    this.videoElement.nativeElement.srcObject = this.user?.mediaStreamProvider?.getStream();
    this.videoElement.nativeElement.addEventListener('loadedmetadata', () => {
      this.videoElement.nativeElement.play()
    })
    if(this.user.isMe) {
      this.videoElement.nativeElement.muted = true;
    }
    
  }
  ngOnDestroy(){
      if(this.time){
        try{
          this.time.unsubscribe();
        } catch {}
      }
  }
}
