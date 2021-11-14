import { LastSpeakersService } from './../../last-speakers.service';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../user/user';

@Component({
  selector: 'room-layout-spotlight',
  templateUrl: './layout-spotlight.component.html',
  styleUrls: ['./layout-spotlight.component.scss']
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
