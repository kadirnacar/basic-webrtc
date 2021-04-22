<script type="ts">
import { onMount } from 'svelte';
import Sidebar from '../components/Sidebar.svelte';
import { RtcClient } from '../lib/RtcClient';
import * as Tools from '../tools';

let connected = false;
let rtcClient: RtcClient;
let videoElement: HTMLVideoElement;
const constraints = {
  audio: false,
  video: true,
};

onMount(async () => {});

const serveCam = async (ev: Event) => {
  ev.preventDefault();
  if (!connected) {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    videoElement.play();

    const id = Tools.uuidv4();

    rtcClient = new RtcClient(new URL('http://localhost:3005'), id, `${id}`, true);

    rtcClient.onSignallingServerConnected = () => {
      console.log('Connected to Signalling Server');
      stream.getTracks().forEach((track) => rtcClient.addTrack(track, stream));
      connected = true;
    };

    rtcClient.onDisconnect = (streamerId) => {
      console.log('Disconnected from Signalling Server', streamerId);
      connected = false;
      const stream: any = videoElement.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach(function (track) {
        track.stop();
      });

      videoElement.srcObject = null;
    };

    rtcClient.onMessage = (ev) => {
      console.log(ev);
    };

    rtcClient.connectToSignalling();
  } else if (rtcClient) {
    rtcClient.disconnect();
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
  <video bind:this={videoElement} />
</div>
