import { LocalInputProviderService } from './local-input-provider.service';
import { SelfDataTransfer } from './room/userdata/selfdata/self-data-transfer';
import { ISelfDataProvider } from './room/userdata/iself-data-provider';
import { ChatMessage } from './room/chat/chat-message';
import { UserStatus } from './room/user-status/user-status';
import { MediaStreamProvider } from './room/mediastreamprovider';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {io} from 'socket.io-client';
import { ReplaySubject } from 'rxjs';
import { convertPropertyBindingBuiltins } from '@angular/compiler/src/compiler_util/expression_converter';
import { Local } from 'protractor/built/driverProviders';

declare var Peer:any;
@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private socket;
  private peer;
  private streams:MediaStream[] = [];
  private dataConnections:any[] = [];
  public currentStatus:UserStatus = new UserStatus();


  public selfStreamProvider:MediaStreamProvider;

  public peers = [];
  public clientId:string;

  public selfStream:MediaStream;

  public selfDataProvier:ISelfDataProvider;

  public userJoinEvent:ReplaySubject<any> = new ReplaySubject<any>(1);
  public userLeaveEvent:ReplaySubject<any> = new ReplaySubject<any>(1);
  public incomingStreamEvent:ReplaySubject<[string, MediaStreamProvider]> = new ReplaySubject<[string, MediaStreamProvider]>(1);
  public statusChanged:ReplaySubject<[string, UserStatus]> = new ReplaySubject<[string, UserStatus]>(1);
  public receiveMessage:ReplaySubject<[string, ChatMessage]> = new ReplaySubject<[string, ChatMessage]>(1);
  public userDataIncoming:ReplaySubject<[string, SelfDataTransfer]> = new ReplaySubject<[string, SelfDataTransfer]>(1);

  constructor() {

  }
  public startConnection(inputService:LocalInputProviderService = null) {
    const myPeer = new Peer(undefined, {
      host: 'dev.local',
      secure: true,
      port: 3001,
    });
    this.peer = myPeer;
    myPeer.on('open', id => {
      console.log("[CONN] MY PEERJS ID IS: " +id);
      this.clientId = id;
      this.currentStatus.clientId = id;
      this.userJoinEvent.next(id);
      this.init(inputService);
    })
  }
  private init(localInputProvider:LocalInputProviderService = null) {
    this.socket = io("/");

    console.log( this.peer );

    let userMediaQuery = {
      "video": null,
      "audio": null
    };


    if(localInputProvider != null) {
      if(localInputProvider.videoEnabled && localInputProvider.currentVideoInput != null) {
        userMediaQuery.video = {"deviceId": localInputProvider.currentVideoInput.deviceId};
      }

      if(localInputProvider.micEnabled && localInputProvider.currentAudioInput != null) {
        userMediaQuery.audio = {"deviceId": localInputProvider.currentAudioInput.deviceId};
      }
    }

    if(userMediaQuery.audio == null) {
      userMediaQuery.audio = false;
    }

    if(userMediaQuery.video == null) {
      userMediaQuery.video = false;
    }

    console.log("[CONN] UserMedia Query: ", userMediaQuery);
    if(userMediaQuery.audio == false && userMediaQuery.video == false) {
      console.log("[CONN] No video and audio permission. Joining only as spectator.");
      this.setUpConnections(null, true);
    }else {
      console.log("[CONN] Got video and audio permission. Joining...");
      navigator.mediaDevices.getUserMedia(userMediaQuery).then(stream => {
        this.setUpConnections(stream, false);
      });
    }
  }

  private setUpConnections(stream:MediaStream = null, spectator = false) {
    this.selfStreamProvider = new MediaStreamProvider(stream);
    this.selfStream = this.selfStreamProvider.getStream();


    if(!spectator){
      this.selfStreamProvider.measureMicLevel();
      this.selfStreamProvider.isSpeaking.subscribe(talkState => {
        if(talkState) {
          console.log("[CONN MIC] Speaking");
          
        }else {
          console.log("[CONN MIC] Not speaking");
        }
        this.updateSpeakingStateStatus(talkState);
      })
    }


    this.incomingStreamEvent.next([this.clientId, this.selfStreamProvider]);

    this.addVideoStream(this.selfStream, this.clientId);
    
    //Other useres connecting to me when I join the room.
    this.peer.on('call', call => {
      let opts = call.options;
      console.log("[CONN] Call options: ");
      console.log(opts);
      let caller = opts.metadata.caller;
      console.log("[CONN] Incoming call... answering...");
      call.answer(this.selfStream);
      call.on('stream', userVideoStream => {
        console.log("[CONN] Sending my own stream...");
        this.addVideoStream(userVideoStream, caller.id)
        let mediaStreamProvider = new MediaStreamProvider(userVideoStream);
        this.incomingStreamEvent.next([caller.id, mediaStreamProvider]);
      })
    });

    this.socket.emit('join-room', "asd", this.clientId)
    console.log("[CONN] Joining room: " + "asd");
    console.log("[CONN] My id is: " + this.clientId);

    this.socket.on('user-connected', userId => {
      this.connectToNewUser(userId, this.selfStream)
      console.log("[CONN] New user connected to the room: " + userId);
      this.userJoinEvent.next(userId);
    })

    this.socket.on('user-disconnected', userId => {
      if (this.peers[userId]) this.peers[userId].close()
      console.log("[CONN] User disconnected: " + userId);
      this.removeVideoStream(userId);
      this.userLeaveEvent.next(userId);
    })

    this.peer.on('connection', conn => {
      console.log("[CONN DATA IN] Incoming data connection with " + conn.peer);
      this.makeStatusConnection(conn.peer);
      conn.on('open', () => {
        this.broadcastMyStatus();
        this.sendMySelfData(conn.peer);
        // Receive messages
        conn.on('data', data => {
          console.log('[CONN DATA IN] Received', data);
          try {
            console.log(data);
            if(data !== null) {
              switch(data[0]) {
                case "status":
                  this.statusChanged.next([conn.peer, data[1]]);
                break;
                case "chatMessage":
                  this.receiveMessage.next([conn.peer, data[1]]);
                break;
                case "self-data":
                  this.userDataIncoming.next([conn.peer, data[1]]);
                  this.sendMySelfData(conn.peer, true);
                break;
                case "self-data-answer":
                  this.userDataIncoming.next([conn.peer, data[1]]);
                break;
                default:
                  console.error("[CONN] Unknown received data type:" + data);
                break;
              }
                
            }
            return true;
          } catch (e) {
              console.error(e);
              return false;
          }
        });
      
      });
    });
  }
  public addVideoStream(stream: MediaStream, id:string) {
    console.log("[CONN] Adding video stream: " + id);
    this.streams[id] = stream;
    return true;
  }
  public removeVideoStream(id:string) {
    delete this.streams[id];
    console.log("[CONN]" + id + " removed");
    return true;
  }
  
  public connectToNewUser(userId, stream) {
    //Me connecting to other user who joined the room.
    let opts = {"metadata": {"caller": {"id": this.clientId}}};
    const call = this.peer.call(userId, stream, opts);
    console.log("[CONN] Calling user: " +userId);
    call.on('stream', userVideoStream => {
      console.log("[CONN] Receiving stream from: " + userId);
      this.addVideoStream(userVideoStream, userId);
      let mediaStreamProvider = new MediaStreamProvider(userVideoStream);
      this.incomingStreamEvent.next([userId, mediaStreamProvider]);
    })
    call.on('close', () => {
    console.log("[CONN] Call closed: " +userId);
    })

    this.makeStatusConnection(userId);
    this.peers[userId] = call
  }
  public makeStatusConnection(userId) {
    if(this.dataConnections[userId] == undefined) {
      console.log("[CONN DATA] Making data connection with " + userId);
      let conn = this.peer.connect(userId, {"serialization": "json", "reliable": true});
      this.dataConnections[userId] = conn;
      this.sendMySelfData(userId);
    }
  }
  public updateMicMuteStatus(muted:boolean = true) {
    console.log("[CONN STATUS] Mic status updated: " + muted);
    this.currentStatus.isMuted = muted;
    this.statusChanged.next([this.clientId, this.currentStatus]);
    this.broadcastMyStatus();
  }
  public updateSpeakingStateStatus(speaking:boolean = false) {
    console.log("[CONN STATUS] Talking status updated: " + speaking);
    this.currentStatus.isSpeaking = speaking;
    this.statusChanged.next([this.clientId, this.currentStatus]);
    this.broadcastMyStatus();
  }
  public broadcastMyStatus() {
    console.log(this.dataConnections);
    for(let key in this.dataConnections) {
      console.log("[CONN DATA OUT] Sending my updated status.");
      this.dataConnections[key].send(["status", this.currentStatus]);
    }
  }
  public broadcastMySelfData(selfData:ISelfDataProvider = null) {
    console.log(this.dataConnections);
    for(let key in this.dataConnections) {
      console.log("[CONN DATA OUT] Sending my updated data.");
      this.sendMySelfData(key, false, selfData);
    }
  }
  public sendMySelfData(connectionId, answer = false, selfData:ISelfDataProvider = null) {
    if(selfData == null) {
      selfData = this.selfDataProvier;
    }
    let name = selfData.getName();
    let image = selfData.getProfileImageUrl();
    let transferObj = new SelfDataTransfer();
    transferObj.name = name;
    transferObj.profileImageUrl = image;
    if(answer) {
      this.dataConnections[connectionId].send(["self-data-answer", transferObj]);
    }else {
      this.dataConnections[connectionId].send(["self-data", transferObj]);
    }
  }
  public sendMessage(message:ChatMessage) {
    console.log(this.dataConnections);
    for(let key in this.dataConnections) {
      console.log("[CONN DATA] Sending my message.");
      this.dataConnections[key].send(["chatMessage", message]);
    }
  }

  public getVideos():Observable<MediaStream[]>{
    return of(this.streams);
  }
}
