<script type="ts">
import { onMount } from 'svelte';
import Sidebar from '../components/Sidebar.svelte';
import { RtcClient } from '../lib/RtcClient';
import * as Tools from '../tools';

let rtcClient: RtcClient;
let connected = '';
let streamers = [];
let videoElement: HTMLVideoElement;
let ws: WebSocket;
let playerId: string;

onMount(async () => {
  playerId = Tools.uuidv4();

  ws = new WebSocket(`ws://localhost:3005`);

  ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    if (data.type == 'streamers') {
      streamers = data.streamers;
    }
  };

  ws.onopen = (event) => {
    ws.send(JSON.stringify({ type: 'getStreamers' }));
  };

  // rtcClient = new RtcClient(new URL('http://localhost:3005'), `${id}/client`, true);

  // rtcClient.onSignallingServerConnected = () => {
  //   console.log('Connected to Signalling Server');
  //   rtcClient.sendSocketMessage(JSON.stringify({ type: 'getStreamers' }));
  // };

  // rtcClient.onDisconnect = () => {
  //   console.log('Disconnected from Signalling Server');
  // };

  // rtcClient.onMessage = (ev) => {
  //   if (ev.type == 'streamers') {
  //     streamers = ev.streamers;
  //   }
  // };

  // rtcClient.onStreamConnect = async (ev) => {
  //   videoElement.srcObject = ev.streams[0];
  //   videoElement.muted = true;
  //   try {
  //     await videoElement.play();
  //   } catch {}
  //   return null;
  // };

  // rtcClient.connectToSignalling();
});

const connect = async (ev: Event, streamer) => {
  ev.preventDefault();

  rtcClient = new RtcClient(new URL('http://localhost:3005'), `${playerId}/client`, true);

  rtcClient.onSignallingServerConnected = async () => {
    console.log('Connected to Signalling Server');
    await rtcClient.sendOffer(streamer);
  };

  // rtcClient.onDisconnect = () => {
  //   console.log('Disconnected from Signalling Server');
  // };

  // rtcClient.onMessage = (ev) => {
  //   if (ev.type == 'streamers') {
  //     streamers = ev.streamers;
  //   }
  // };

  // rtcClient.onStreamConnect = async (ev) => {
  //   videoElement.srcObject = ev.streams[0];
  //   videoElement.muted = true;
  //   try {
  //     await videoElement.play();
  //   } catch {}
  //   return null;
  // };

  rtcClient.connectToSignalling();

  // await rtcClient.sendOffer();
};
</script>

<style>
</style>

<Sidebar>
  {#each streamers as streamer, i}
    <li class="nav-item">
      <a
        class={`nav-link btn ${connected == streamer ? 'btn-danger' : 'btn-primary'}`}
        aria-current="page"
        href="/"
        on:click={(ev) => connect(ev, streamer)}>
        <span data-feather="home" />
        {streamer}
        {connected == streamer ? 'Disconnect' : 'Connect'}
      </a>
    </li>
  {/each}
</Sidebar>
<div class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
  <video bind:this={videoElement} controls={false} muted />
</div>
