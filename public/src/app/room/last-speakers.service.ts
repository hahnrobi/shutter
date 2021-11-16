import { UserStatus } from './user-status/user-status';
import { ConnectionService } from './connection.service';
import { Injectable } from '@angular/core';
import { User } from './user/user';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LastSpeakersService {
  private _speakerList:string[] = [];
  private _connectionService:ConnectionService;
  private subs = [];
  public speakersList:ReplaySubject<string[]>;
  public latestSpeaker:ReplaySubject<string>;

  constructor(_connectionService:ConnectionService) {
    this.speakersList = new ReplaySubject<string[]>();
    this.latestSpeaker = new ReplaySubject<string>();
    this._connectionService = _connectionService;
    
  }
  public init() {
    console.log("[LAST SPEAKER SERVICE INIT]")
    //Have a default speaker when initializing. Using self view.
    this.processSpeakingStatusChange(this._connectionService.clientId, true);

    this._connectionService.statusChanged.subscribe((tuple: [string, UserStatus]) => {
      let clientId:string = tuple[0];
      let status:UserStatus = tuple[1];
      
      this.processSpeakingStatusChange(clientId, !status.isMuted && status.isSpeaking);
    })

    this._connectionService.userLeaveEvent.subscribe((clientId: string) => {
      this.processSpeakingStatusChange(clientId, false);
      if(Object.keys(this._speakerList).length > 0) {
        //If there are other speakers, switch view to them.
        this.processSpeakingStatusChange(Object.keys(this._speakerList)[0], true);
      }else {
        //If there is no one else, change back to our own camera.
        this.processSpeakingStatusChange(this._connectionService.clientId, true);
      }
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
    } else {
        delete this._speakerList[clientId];
        this.speakersList.next(this._speakerList);
    }
  }
}
