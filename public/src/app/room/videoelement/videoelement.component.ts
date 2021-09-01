import { faMicrophoneSlash, faThumbsDown, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { Component, ElementRef, Input,Inject, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { NB_WINDOW, NbMenuService } from '@nebular/theme';
import { User } from '../user/user';
import { Observable, timer } from 'rxjs';
import { filter, map } from 'rxjs/operators';


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

  contextMenuItems = [{ title: 'Contain videos in frame', icon: "crop-outline", target: "toggleSizing" }, { title: 'Cover videos in frame', icon: "expand-outline", target: "toggleSizing", hidden: true }, {title: "asd"}];

  constructor(private nbMenuService: NbMenuService, @Inject(NB_WINDOW) private window) {

  }

  ngOnInit(): void {
    this.time = this.everyFiveSeconds.subscribe(() => {
      let u = this.user;
      this.user = null;
      this.user=u;
    });


    this.nbMenuService.onItemClick()
    .pipe(
      map(({ item }) => item),
    )
    .subscribe(item => {
      if(item.target == "toggleSizing") {
        this.contextMenuItems.forEach(element => {
          element.hidden = false;
        });
        if(this.videoSizing === "cover") {
          this.videoSizing = "contain";
        }else {
          this.videoSizing = "cover";
        }
        item.hidden = true;
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
