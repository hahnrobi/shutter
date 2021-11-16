import { UserManagerService } from './../../user-manager.service';
import { ConnectionService } from './../../connection.service';
import { User } from './../../user/user';
import { Component, ElementRef, HostListener, Input, IterableDiffers, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'room-layout-gallery',
  templateUrl: './layout-gallery.component.html',
  styleUrls: ['./layout-gallery.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.5s ease-out', style({ opacity: '1' })),
      ]),
    ]),
  ],
})
export class LayoutGalleryComponent implements OnInit {
  @Input() users:any[];
  @ViewChildren('videoFrame') videoFrames:QueryList<any>;
  @ViewChild('videoGrid') videoGrid:ElementRef;
  private iterableDiffer : any;

  public isEmpty = true;

  constructor(private iterableDiffers:IterableDiffers) {
    this.iterableDiffer = iterableDiffers.find([]).create(null);
  }

  ngOnInit(): void {
  }

  ngDoCheck() {
      let changes = this.iterableDiffer.diff(this.videoGrid?.nativeElement?.childNodes);
      if (changes) {
        let validUsersNum = Object.values(this.users).filter(user => !user.spectator).length > 0;
        if (validUsersNum) {
          this.isEmpty = false;
        }else {
          this.isEmpty = true;
        }
        this.resizeVideoFrames();
      }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeVideoFrames();
  }

  private canFit(increment, n, width, height, margin = 10) {
    let w = 0;
    let i = 0;
    let h = increment * 0.75 + (margin * 2);
    while (i < (n)) {
        if ((w + increment) > width) {
            w = 0;
            h = h + (increment * 0.75) + (margin * 2);
        }
        w = w + increment + (margin * 2);
        i++;
    }
    if (h > height) return false;
    else return increment;
  }
  private setWidth(width, margin) {
    this.videoFrames.toArray().forEach(camera => {
      camera.nativeElement.style.width = width + "px";
      camera.nativeElement.style.margin = margin + "px";
      camera.nativeElement.style.height = (width * 0.75) +"px";
    })
  }
  private resizeVideoFrames() {
        let margin = 2;
        let width = this.videoGrid.nativeElement.offsetWidth - (margin * 2);
        let height = this.videoGrid.nativeElement.offsetHeight - (margin * 2);
        let max = 0;

        let i = width;
        let w = this.canFit(i, this.videoFrames.length, width, height, margin);
        while(w == false || i > 0) {
          w = this.canFit(i, this.videoFrames.length, width, height, margin);
            if (w !== false) {
                max =  i - 1;
                break;
            }
            i--;
        } 
    
        max = max - (margin * 2);
        this.setWidth(max, margin);
  }

}
