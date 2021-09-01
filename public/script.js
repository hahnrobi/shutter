const socket = io('/');
const myPeer = new Peer(undefined, {
	host: 'dev.local',
	secure: true,
	port: 3001,
})
console.log(myPeer);
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');

let videos = [], streams = [];


myVideo.muted = true;
const peers = {}

function init(id) {
	navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true,
	echoCancellation: false,
	noiseSuppression: false,
	autoGainControl: false,
	googAutoGainControl: false,
	mozNoiseSuppression: false,
	mozAutoGainControl: false
	}).then(stream => {
	addVideoStream(myVideo, stream, null)

	myPeer.on('call', call => {
		call.answer(stream)
		let opts = call.options;
		let caller = opts.metadata.caller;
		const video = document.createElement('video')
		call.on('stream', userVideoStream => {
		console.log("Sending my own stream...");
		addVideoStream(video, userVideoStream, id)
		})
	})

	socket.emit('join-room', ROOM_ID, id)
	console.log("Joining room: " + ROOM_ID);
	console.log("My id is: " + id);
	
	socket.on('user-connected', userId => {
		connectToNewUser(userId, stream)
		console.log("New user connected to the room: " + userId);
	})
	})
}

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
  console.log("User disconnected: " + userId);
})

myPeer.on('open', id => {
  init(id);
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  console.log("Calling user: " +userId);
  call.on('stream', userVideoStream => {
	console.log("Receiving stream from: " + userId);
    addVideoStream(video, userVideoStream, userId)

  })
  call.on('close', () => {
	console.log("Call closed: " +userId);
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream, userId) {
	/*if(video == null || stream == null) {
	  return;
  }
  if(videos.includes(video)) {
	  return;
  }
  let container_item = document.getElementById(userId);
  if(container_item !=  null) {
	  container_item.remove();
  }*/
  videos[userId] = video;
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  /*let video_meter = document.createElement('div');

  const context = new(window.AudioContext || window.webkitAudioContext)();

  var track = context.createMediaStreamSource(stream);

  const gain1 = context.createGain();

  const analyser = context.createAnalyser();

  // Reduce output level to not hurt your ears.
  const gain2 = context.createGain();
  gain2.gain.value = 0;

  track.connect(gain1);
  gain1.connect(analyser);
  analyser.connect(gain2);
  gain2.connect(context.destination);

  function displayNumber(id, value) {
	//const meter = document.getElementById(id + '-level');
	//const text = document.getElementById(id + '-level-text');
	//text.textContent = value.toFixed(2);
	let vu = (isFinite ? value : 1);
	
	if(vu > -40 && vu <=0) {
	  let in_vu = 40-Math.abs(vu);
	  video_meter.style.border = in_vu + "px solid rgba(255,255,255,.2)";
	  video_meter.display = "block";
	}else {
		video_meter.style.border = "none";
		video_meter.display = "none";
	}
  }

  // Time domain samples are always provided with the count of
  // fftSize even though there is no FFT involved.
  // (Note that fftSize can only have particular values, not an
  // arbitrary integer.)
  analyser.fftSize = 1024;
  const sampleBuffer = new Float32Array(analyser.fftSize);
  let samples = new Float32Array(analyser.fftSize*2);
  let latestSample = 0;

  function loop() {
	// Vary power of input to analyser. Linear in amplitude, so
	// nonlinear in dB power.
	//gain1.gain.value = 0.5 * (1 + Math.sin(Date.now() / 4e2));
	gain1.gain.value = 1;

	analyser.getFloatTimeDomainData(sampleBuffer);
	// Compute average power over the interval.
	let sumOfSquares = 0;
	for (let i = 0; i < sampleBuffer.length; i++) {
		samples[latestSample++] = sampleBuffer[i] ** 2;
		if(latestSample > samples.length) {
			latestSample = 0;
		}
	}
	for (let i = 0; i < samples.length; i++) {
		sumOfSquares += samples[i];
	}
	const avgPowerDecibels = 10 * Math.log10(sumOfSquares / samples.length);


	// Note that you should then add or subtract as appropriate to
	// get the _reference level_ suitable for your application.

	// Display value.
	displayNumber('avg', avgPowerDecibels);
	//displayNumber('inst', peakInstantaneousPowerDecibels);

	requestAnimationFrame(loop);
  }
  loop();

  video_meter.classList.add("video-vu-meter");

  let video_container = document.createElement('div');
  video_container.append(video_meter);
  video_container.id = userId;
  video_container.classList.add("video-container");
  video_container.append(video);
  console.log(video);*/
  videoGrid.append(video)
}