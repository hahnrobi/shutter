import { interval, ReplaySubject } from 'rxjs';
export class MediaStreamProvider {
	private stream:MediaStream;
	private micAudioLevel:number;

	private audioInterval;

	private isSpeakingValue:boolean = false;
	public isSpeaking:ReplaySubject<boolean>;

	constructor(_stream:MediaStream) {
		this.stream = _stream;
	}
	private setAudioTracksEnabled(state:boolean):void {
		let tracks = this.stream.getAudioTracks();
		tracks.forEach(track => {
			track.enabled = state;
		});
	}
	public muteStream():void {
		this.setAudioTracksEnabled(false);
	}
	public unMuteStream():void {
		this.setAudioTracksEnabled(true);
	}
	public getStream():MediaStream {
		return this.stream
	}
	public isAudioMuted():boolean {
		let tracks = this.stream.getAudioTracks();
		let muted = false;
		tracks.forEach(track => {muted = !track.enabled});
		return muted;
	}
	private setVideoTracksEnabled(state:boolean):void {
		let tracks = this.stream.getVideoTracks();
		tracks.forEach(track => {track.enabled = state;});
	}
	public turnOffCamera():void {
		this.setVideoTracksEnabled(false);
	}
	public turnOnCamera():void {
		this.setVideoTracksEnabled(true);
	}
	public isWebcamOn():boolean {
		let tracks = this.stream.getVideoTracks();
		let muted = false;
		tracks.forEach(track => {muted = !track.enabled});
		return muted;
	}
	public measureMicLevel() {
		this.isSpeaking = new ReplaySubject<boolean>();
		const context = new(window.AudioContext)();

		let source = context.createMediaStreamSource(this.stream);
	  
		const gain1 = context.createGain();
	  
		const analyser = context.createAnalyser();
	  ;
	  
		source.connect(gain1);
		gain1.connect(analyser);
		//analyser.connect(gain1);
	  
		function displayNumber(id, value) {
		  //console.log(value);
		}
	  
		// Time domain samples are always provided with the count of
		// fftSize even though there is no FFT involved.
		// (Note that fftSize can only have particular values, not an
		// arbitrary integer.)
		analyser.fftSize = 8192;
		const sampleBuffer = new Float32Array(analyser.fftSize);
	  
		function loop() {
		  console.log("measuring mic");
		  // Vary power of input to analyser. Linear in amplitude, so
		  // nonlinear in dB power.
		  gain1.gain.value = 0.5 * (1 + Math.sin(Date.now() / 4e2));
	  
		  analyser.getFloatTimeDomainData(sampleBuffer);
	  
		  // Compute average power over the interval.
		  let sumOfSquares = 0;
		  for (let i = 0; i < sampleBuffer.length; i++) {
			sumOfSquares += sampleBuffer[i] ** 2;
		  }
		  const avgPowerDecibels = 10 * Math.log10(sumOfSquares / sampleBuffer.length);
	  
		  // Compute peak instantaneous power over the interval.
		  let peakInstantaneousPower = 0;
		  for (let i = 0; i < sampleBuffer.length; i++) {
			const power = sampleBuffer[i] ** 2;
			peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
		  }
		  const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);
	  
		  // Note that you should then add or subtract as appropriate to
		  // get the _reference level_ suitable for your application.
	  
		  // Display value.
		  return avgPowerDecibels;
		  
		}
		this.audioInterval = interval(1000);
		const subscribe = this.audioInterval.subscribe(v => {
			let audioLevel = 0;
			let muted = false;
			if(this.isAudioMuted()) {
				muted = true;
			}else {
				audioLevel = loop();
			}
			
			if(muted || audioLevel < -80) {
				if(this.isSpeakingValue != false) {
					this.isSpeakingValue = false;
					this.isSpeaking.next(false);
				}
			}else {
				if(this.isSpeakingValue != true) {
					this.isSpeakingValue = true;
					this.isSpeaking.next(true);
				}
			}
		});
	}
}
