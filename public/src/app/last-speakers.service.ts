import { UserStatus } from './room/user-status/user-status';
import { ConnectionService } from './connection.service';
import { Injectable } from '@angular/core';
import { User } from './room/user/user';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LastSpeakersService {
  private _speakerList:string[] = [];
  private _connectionService:ConnectionService;
  public speakersList:ReplaySubject<string[]>;
  public latestSpeaker:ReplaySubject<string>;

  constructor(_connectionService:ConnectionService) {
    this.speakersList = new ReplaySubject<string[]>();
    this.latestSpeaker = new ReplaySubject<string>();
    this._connectionService = _connectionService;
    
  }
  public init() {
    this._connectionService.statusChanged.subscribe((tuple) => {
      let clientId:string = tuple[0];
      let status:UserStatus = tuple[1];

      this.processSpeakingStatusChange(clientId, status.isSpeaking);
    })
    this._connectionService.selfStreamProvider.isSpeaking.subscribe((speakingState:boolean) => {
      this.processSpeakingStatusChange(this._connectionService.clientId, speakingState);
    })
  }
  private processSpeakingStatusChange(clientId:string, status:boolean) {
    if(status) {
        this._speakerList[clientId] = clientId;
        this.speakersList.next(this._speakerList);
        this.latestSpeaker.next(clientId);
    }else {
        delete this._speakerList[clientId];
        this.speakersList.next(this._speakerList);
    }
  }
}
