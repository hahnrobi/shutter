import { Observable, Subject, ReplaySubject } from 'rxjs';
import { MediaStreamProvider } from './mediastreamprovider';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalInputProviderService {

  public audioInputs:ReplaySubject<MediaDeviceInfo[]> = new ReplaySubject<MediaDeviceInfo[]>()
  private _audioInputs: MediaDeviceInfo[] = [];
  public videoInputs:ReplaySubject<MediaDeviceInfo[]> = new ReplaySubject<MediaDeviceInfo[]>();
  private _videoInputs: MediaDeviceInfo[] = [];

  
  public defaultAudioInput:MediaDeviceInfo;
  public defaultVideoInput:MediaDeviceInfo;

  public currentAudioInput:MediaDeviceInfo;
  public currentVideoInput:MediaDeviceInfo;
  
  public videoEnabled:boolean = true;
  public micEnabled:boolean = true;

  public micAllowed:Subject<boolean>;
  private _micAllowed:boolean = true;
  public videoAllowed:Subject<boolean>;
  private _videoAllowed:boolean = true;

  public deviceReceived:ReplaySubject<[MediaDeviceInfo, MediaDeviceInfo]>;

  constructor() {
    this.micAllowed = new Subject<boolean>();
    this.videoAllowed = new Subject<boolean>();
    this.deviceReceived = new ReplaySubject<[MediaDeviceInfo, MediaDeviceInfo]>();
    this.requestPermissions().then(() => {
    navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      this.setInputDevices(devices)
      this.getDefaultInputDevices();

      this.deviceReceived.next([this.defaultAudioInput, this.defaultVideoInput]);
      this.currentAudioInput = this.defaultAudioInput;
      this.currentVideoInput = this.defaultVideoInput;
    })
    .catch(function(err) {
      console.error(err.name + ": " + err.message);
    });
  
  });
  }

  private getLastUsedDevices() {
    const storageItem = localStorage.getItem("lastUsedDevices");
    let parsedObj = null;
    if(storageItem != null && storageItem.length > 0) {
      try {
        parsedObj = JSON.parse(storageItem);
      } catch (e) {
        console.error(e);
      }
    }
    return parsedObj;
  }
  private stopStreamTracks(stream:MediaStream) {
    stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  public saveUsedDevices(videoId:string, audioId: string) {
    this.currentVideoInput = this._videoInputs.find(input => input.deviceId == videoId);
    this.currentAudioInput = this._audioInputs.find(input => input.deviceId == audioId);
    const item = {}
    if(this.videoAllowed) {
      item["video"] = videoId;
    }
    if(this.micAllowed) {
      item["audio"] = audioId;
    }
    if(item != null) {
      console.log("[LOCALINPUT-PROVIDER] Saving to localstorage ", item);
      localStorage.setItem("lastUsedDevices", JSON.stringify(item));
    }
  }

  public getDefaultInputDevices():void {
    let audioDevice = null;
    let videoDevice = null;
    
    const lastUsed = this.getLastUsedDevices();
    if(this._videoAllowed) {
      if(lastUsed != null && lastUsed.hasOwnProperty("video")) {
        const arrayCheck = this._videoInputs.filter(x => x.deviceId === lastUsed.video);
        if(arrayCheck.length > 0) {
          videoDevice = arrayCheck[0];
        }
      }
      if(videoDevice == null && this._videoInputs.length > 0) {
        videoDevice = this.videoInputs[0];
      }
    }
    

    if(this._micAllowed) {
      const lastUsed = this.getLastUsedDevices();
      if(lastUsed != null && lastUsed.hasOwnProperty("audio")) {
        const arrayCheck = this._audioInputs.filter(x => x.deviceId === lastUsed.audio);
        if(arrayCheck.length > 0) {
          audioDevice = arrayCheck[0];
        }
      }
      if(audioDevice == null && this._audioInputs.length > 0) {
        audioDevice = this.audioInputs[0];
      }
    }
    this.defaultVideoInput = videoDevice;
    this.defaultAudioInput = audioDevice;
  }

  public async refreshInputDevices() {    
    let newDevices = [];
    await navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      if(devices.length > 0) {
        this.setInputDevices(newDevices);
      }
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });
  }
  public setInputDevices(devices:MediaDeviceInfo[]) {
    //this.audioInputs = [];
    //this.videoInputs = [];
    devices.forEach(dev => {
      if (dev.kind == "audioinput") {
        this._audioInputs.push(dev);
      }
      if (dev.kind == "videoinput") {
        this._videoInputs.push(dev);
      }
    });
    this.audioInputs.next(this._audioInputs);
    this.videoInputs.next(this._videoInputs);
  }

  public async requestPermissions(type:"audio"|"video"|"both" = "both")
  {
    if(type == "video" || type == "both") {
    await navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then((stream) => {
        this._videoAllowed = true;
        this.videoAllowed.next(this._videoAllowed);
        this.stopStreamTracks(stream);
      })
      .catch((err) => {this._videoAllowed = false;
        this.videoAllowed.next(this._videoAllowed);});
    }

    if(type == "audio" || type == "both") {
    await navigator.mediaDevices.getUserMedia({video: false, audio: true})
      .then((stream) => {
        this._micAllowed = true;
        this.micAllowed.next(this._micAllowed);
        this.stopStreamTracks(stream);
      })
      .catch((err) => {this._micAllowed = false;
        this.micAllowed.next(this._micAllowed);});

    }
      console.log("Mic enabled: ", this._micAllowed);
      console.log("Video enabled: ", this._videoAllowed);
    this.refreshInputDevices();
  }
  public async getVideo(deviceId:string) {
    let stream = null;
    await navigator.mediaDevices.getUserMedia({video: {deviceId: deviceId}, audio: false})
      .then((s) => {this._videoAllowed = true;
        this.videoAllowed.next(this._videoAllowed);; stream = s;})
      .catch((err) => {this._videoAllowed = false;
        this.videoAllowed.next(this._videoAllowed);});
    return new MediaStreamProvider(stream);
  }
  public async getAudio(deviceId:string) {
    let stream = null;
    await navigator.mediaDevices.getUserMedia({video: false, audio: {deviceId: deviceId}})
      .then((s) => {this._micAllowed = true;
        this.micAllowed.next(this._micAllowed);
        stream = s;})
      .catch((err) => {
        console.error(err);
        this._micAllowed = false;
        this.micAllowed.next(this._micAllowed);});
    return new MediaStreamProvider(stream);
  }

  public dispose() {
  }

}
