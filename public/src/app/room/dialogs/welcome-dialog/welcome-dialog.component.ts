import { MediaStreamProvider } from './../../mediastreamprovider';
import { LocalInputProviderService } from './../../local-input-provider.service';
import { Component, OnInit,  Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss']
})
export class WelcomeDialogComponent implements OnInit {
  public _localInputProviderService:LocalInputProviderService;

  public inputNameText:string;
  public audioDeviceList:MediaDeviceInfo[];
  public videoDeviceList:MediaDeviceInfo[];

  public audioAllowed = false;
  public videoAllowed = false;

  public audioEnabled = true;
  public videoEnabled = true;

  public selectedVideoDevice:string;
  public selectedAudioDevice:string;


  public selectedAudioDeviceMediaStreamProvider:MediaStreamProvider;
  public selectedAudioDeviceLevel:number;

  public selectedVideoChanged:EventEmitter<string> = new EventEmitter<string>();

  public selectedVideoDeviceMediaStreamProvider:MediaStreamProvider;

  @ViewChild('video') videoElement:ElementRef;
  @Output() enteredName = new EventEmitter<string>();
  @Output() deviceConfig = new EventEmitter<LocalInputProviderService>();
  constructor(_localInputProviderService:LocalInputProviderService) {
    this._localInputProviderService = _localInputProviderService,
    this._localInputProviderService.deviceReceived.subscribe(d => {
      console.log(d[1]);
      this.selectedAudioDevice = d[0]?.deviceId;
      this.selectedVideoDevice = d[1]?.deviceId;

      this.changeAudioInputDevice(d[0].deviceId);
      this.changeVideoInputDevice(d[1].deviceId);
      
    });
    this.audioDeviceList = _localInputProviderService.audioInputs;
    this.videoDeviceList = _localInputProviderService.videoInputs;

    _localInputProviderService.micAllowed.subscribe(t => this.audioAllowed = t);
    _localInputProviderService.videoAllowed.subscribe(t => this.videoAllowed = t);

  }


  ngOnInit(): void {
    this.selectedAudioDevice = this._localInputProviderService.defaultAudioInput.deviceId;
  }
  public saveName() {
    this.enteredName.emit(this.inputNameText);
    this.deviceConfig.emit(this._localInputProviderService);
  }

  public changeAudioEnabledStatus(status:boolean) {
    this.audioEnabled = status;
    this._localInputProviderService.micEnabled = status;
    if(status) {
      this.changeAudioInputDevice(this.selectedAudioDevice);
    }else {
      if(this.selectedAudioDeviceMediaStreamProvider) {
        this.selectedAudioDeviceMediaStreamProvider.dispose()
        this.selectedAudioDeviceMediaStreamProvider = null;
      }
    }
  }
  public changeVideoEnabledStatus(status:boolean) {
    this.videoEnabled = status;
    this._localInputProviderService.videoEnabled = status;
    if(status) {
      this.changeVideoInputDevice(this.selectedVideoDevice);
    }else {
      if(this.selectedVideoDeviceMediaStreamProvider) {
        this.selectedVideoDeviceMediaStreamProvider.dispose();
        this.selectedVideoDeviceMediaStreamProvider= null;
      }
    }
  }
  changeVideoInputDevice(deviceId:string) {
    this._localInputProviderService.saveUsedDevices(deviceId, this.selectedAudioDevice);
    
    this._localInputProviderService.getVideo(deviceId).then(streamProvider => {
      if(this.selectedAudioDeviceMediaStreamProvider != null) {
        this.selectedAudioDeviceMediaStreamProvider.dispose();
        this.selectedAudioDeviceMediaStreamProvider = null;
      }

      this.selectedVideoDeviceMediaStreamProvider = streamProvider;
      this.videoElement.nativeElement.srcObject = streamProvider.getStream();
      this.videoElement.nativeElement.addEventListener('loadedmetadata', () => {
        this.videoElement.nativeElement.play()
      })
    });
  }
  changeAudioInputDevice(deviceId) {
    this._localInputProviderService.saveUsedDevices(this.selectedVideoDevice, deviceId);
    if(this.selectedAudioDeviceMediaStreamProvider != null) {
      
      this.selectedAudioDeviceMediaStreamProvider.dispose();
      this.selectedAudioDeviceMediaStreamProvider = null;
    }
    let s = this._localInputProviderService.getAudio(deviceId).then((s) => {
      this.selectedAudioDeviceMediaStreamProvider = s;
      s.measureMicLevel(200, true);
      s.opt_audiolevel.subscribe(l => {
        let level = 80 - (-l);
        if(level < 0) {
          level = 0;
        }
        this.selectedAudioDeviceLevel = level * 1.25;
      });
    });
  }


}