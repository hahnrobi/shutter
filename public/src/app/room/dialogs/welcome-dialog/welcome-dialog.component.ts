import { ExistingUserDataProvider } from './../../userdata/existing-user/existing-user-data-provider';
import { AuthService } from './../../../auth/auth.service';
import { SelfDataLocalStorageProvider } from './../../userdata/selfdata/self-data-local-storage-provider';
import { ISelfDataProvider } from './../../userdata/iself-data-provider';
import { MediaStreamProvider } from './../../mediastreamprovider';
import { LocalInputProviderService } from './../../local-input-provider.service';
import { Component, OnInit,  Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { of } from 'rxjs';

@Component({
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss']
})
export class WelcomeDialogComponent implements OnInit, OnDestroy {
  private audioMeteringSubscription;
  private dataProvider:ISelfDataProvider;
  public devicesReceived:boolean = false;

  

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
  constructor(_localInputProviderService:LocalInputProviderService, _authService: AuthService) {
    this.dataProvider = new SelfDataLocalStorageProvider();
    _authService.$isLoggedIn.subscribe((state) => 
    {
      if(state) {
        this.dataProvider = new ExistingUserDataProvider(_authService);
      }
    })


    this._localInputProviderService = _localInputProviderService,
    this._localInputProviderService.requestPermissions();
    this._localInputProviderService.refreshInputDevices();
    this._localInputProviderService.deviceReceived.subscribe(d => {
      this.devicesReceived = true;
      console.log("Received devices: ", d);
      this.selectedAudioDevice = d[0]?.deviceId;
      this.selectedVideoDevice = d[1]?.deviceId;

      this.changeAudioInputDevice(d[0].deviceId);
      this.changeVideoInputDevice(d[1].deviceId);
      
    });
    this.audioDeviceList = _localInputProviderService.audioInputs;
    this.videoDeviceList = _localInputProviderService.videoInputs;

    _localInputProviderService.micAllowed.subscribe(t => {this.audioAllowed = t; console.log("Mic allowed:", t)});
    _localInputProviderService.videoAllowed.subscribe(t => {this.videoAllowed = t; console.log("Video allowed:", t)});
    console.log("Local audio allowed", this.audioAllowed);

  }


  ngOnInit(): void {
    this.inputNameText = this.dataProvider.getName();
    //this.selectedAudioDevice = this._localInputProviderService.defaultAudioInput.deviceId;
  }
  ngOnDestroy() {
    console.log("destroy");
    this.selectedAudioDeviceMediaStreamProvider?.stopMeasureMicLevel();
    console.log("Video dispose");
    this.selectedVideoDeviceMediaStreamProvider?.dispose();
    console.log("Audio dispose");
    this.selectedAudioDeviceMediaStreamProvider?.dispose();
    this.audioMeteringSubscription?.unsubscribe();
  }


  public saveName() {
    this.dataProvider.setName(this.inputNameText);
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
    this.selectedVideoDevice = deviceId;

    this._localInputProviderService.getVideo(deviceId).then(streamProvider => {
      if(this.selectedVideoDeviceMediaStreamProvider != null) {
        this.selectedVideoDeviceMediaStreamProvider.dispose();
        this.selectedVideoDeviceMediaStreamProvider = null;
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
    this.selectedAudioDevice = deviceId;

    if(this.audioMeteringSubscription) {
      this.audioMeteringSubscription.unsubscribe();
    }
    console.log("Changed audio device: ", deviceId)
    
    if(this.selectedAudioDeviceMediaStreamProvider != null) {
      this.selectedAudioDeviceMediaStreamProvider.stopMeasureMicLevel();
      this.selectedAudioDeviceMediaStreamProvider.dispose();
      this.selectedAudioDeviceMediaStreamProvider = null;
    }
    this._localInputProviderService.getAudio(deviceId).then((streamProvider) => {
      console.log(streamProvider);
      this.selectedAudioDeviceMediaStreamProvider = streamProvider;
      
      streamProvider.measureMicLevel(200, true);
      this.audioMeteringSubscription = streamProvider.opt_audiolevel.subscribe(l => {
        let level = 80 - (-l);
        if(level < 0) {
          level = 0;
        }
        this.selectedAudioDeviceLevel = level * 1.25;
      });
    });
  }
}
