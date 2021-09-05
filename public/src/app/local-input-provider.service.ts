import { Observable, Subject } from 'rxjs';
import { MediaStreamProvider } from './room/mediastreamprovider';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalInputProviderService {

  public audioInputs:MediaDeviceInfo[] = [];
  public videoInputs:MediaDeviceInfo[] = [];

  
  public defaultAudioInput:MediaDeviceInfo;
  public defaultVideoInput:MediaDeviceInfo;
  

  public micAllowed:Subject<boolean>;
  public videoAllowed:Subject<boolean>;

  constructor() {
    this.micAllowed = new Subject<boolean>();
    this.videoAllowed = new Subject<boolean>();
    this.requestPermissions();
    navigator.mediaDevices.enumerateDevices()
    .then((devices) => this.setInputDevices(devices))
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });
  
    this.audioInputs.forEach(a => {
      console.log(a);
    })
  }

  public refreshInputDevices() {
    navigator.mediaDevices.enumerateDevices()
    .then((devices) => this.setInputDevices(devices))
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });
  }
  public setInputDevices(devices:MediaDeviceInfo[]) {
    devices.forEach(dev => {
      if (dev.kind == "audioinput") {
        this.audioInputs.push(dev);
      }
      if (dev.kind == "videoinput") {
        this.videoInputs.push(dev);
      }
    });
    console.log(this.audioInputs);
    console.log(this.videoInputs);
  }

  public async requestPermissions(type:"audio"|"video"|"both" = "both")
  {
    if(type == "video" || type == "both") {
    await navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(() => this.videoAllowed.next(true))
      .catch((err) => this.videoAllowed.next(false));
    }

    if(type == "audio" || type == "both") {
    await navigator.mediaDevices.getUserMedia({video: false, audio: true})
      .then(() => this.micAllowed.next(true))
      .catch((err) => this.micAllowed.next(false));

    }
      console.log("Mic enabled: ", this.micAllowed);
      console.log("Video enabled: ", this.videoAllowed);
    this.refreshInputDevices();
  }
  public async getVideo(deviceId:string) {
    let stream = null;;
    await navigator.mediaDevices.getUserMedia({video: {deviceId: deviceId}, audio: false})
      .then((s) => {this.videoAllowed.next(true); stream = s;})
      .catch((err) => this.videoAllowed.next(false));
    return new MediaStreamProvider(stream);
  }
  public async getAudio(deviceId:string) {
    let stream = null;;
    await navigator.mediaDevices.getUserMedia({video: false, audio: {deviceId: deviceId}})
      .then((s) => {this.videoAllowed.next(true); stream = s;})
      .catch((err) => this.videoAllowed.next(false));
    return new MediaStreamProvider(stream);
  }

}
