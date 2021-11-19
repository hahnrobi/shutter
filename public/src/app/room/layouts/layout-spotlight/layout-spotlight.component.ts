import { LastSpeakersService } from './../../last-speakers.service';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../user/user';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'room-layout-spotlight',
  templateUrl: './layout-spotlight.component.html',
  styleUrls: ['./layout-spotlight.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.5s ease-out', style({ opacity: '1' })),
      ]),
    ]),
  ],
})
export class LayoutSpotlightComponent implements OnInit {
  @Input() users:any[];

  public latestSpeaker:string;

  private _lastSpeakerService:LastSpeakersService;
  constructor(_lastSpeakerService:LastSpeakersService) {
    this._lastSpeakerService = _lastSpeakerService;

    this._lastSpeakerService.latestSpeaker.subscribe(id => {
      this.latestSpeaker = id;
      console.log("Latest speaker"+ id);
    })
  }

  ngOnInit(): void {
  }

}
