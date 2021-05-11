<script type="ts">
import { onDestroy, onMount } from 'svelte';
import { uuidv4 } from '../../tools';

import Sidebar from '../components/Sidebar.svelte';
import { RtcConnection } from '../lib/RtcConnection';

let connected = false;
let videoElement: HTMLVideoElement;
let stream: MediaStream;
const constraints: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: 'environment',
  },
};
let rtcConn: RtcConnection;
let clientId: string;
let clients: string[] = [];

const connect = async () => {
  rtcConn = new RtcConnection(`ws://${window.location.hostname}:3005?clientId=${uuidv4()}&type=streamer`);
  rtcConn.onMessage = (msg) => {
    if (msg.type === 'clients') {
      clients = msg.data.filter((x) => x !== clientId);
    }
  };
  await rtcConn.connectServer();
  clientId = rtcConn.getClientId();
};

onDestroy(() => {
  connected = false;
  if (stream) {
    stream.getTracks().forEach((x) => x.stop());
  }

  if (rtcConn) {
    rtcConn.disconnectServer();
  }
});

const serveCam = async (ev: Event) => {
  ev.preventDefault();
  if (!connected) {
    await connect();
    console.log(navigator.mediaDevices.getSupportedConstraints());
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    rtcConn.addMediaStream(stream);
    videoElement.srcObject = stream;
    videoElement.play();
    connected = true;
  } else {
    videoElement.srcObject = null;
    stream.getTracks().forEach((x) => x.stop());
    connected = false;
    rtcConn.disconnectServer();
  }
};
</script>

<style>
</style>

<Sidebar>
  <li class="nav-item">
    <a class={`nav-link btn ${connected ? 'btn-danger' : 'btn-primary'}`} aria-current="page" href="/" on:click={serveCam}>
      <span data-feather="home" />
      {connected ? 'Stop' : 'Start'} Cam
    </a>
  </li>
</Sidebar>
<div class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
  <video bind:this={videoElement} controls={false} muted />
</div>
