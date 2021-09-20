import { User } from './../../user/user';
import { Component, ElementRef, HostListener, Input, IterableDiffers, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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

  constructor(private iterableDiffers: IterableDiffers) {
    this.iterableDiffer = iterableDiffers.find([]).create(null);
  }

  ngOnInit(): void {
  }

  ngDoCheck() {
      let changes = this.iterableDiffer.diff(this.users);
      if (changes) {
        this.resizeVideoFrames();
      }

      changes = this.iterableDiffer.diff(this.videoGrid?.nativeElement?.childNodes);
      if (changes) {
        this.resizeVideoFrames();
      }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeVideoFrames();
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

}
