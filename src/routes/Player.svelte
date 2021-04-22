<script type="ts">
import { onMount } from 'svelte';
import Sidebar from '../components/Sidebar.svelte';
import { RtcClient } from '../lib/RtcClient';
import * as Tools from '../tools';

let rtcClient: RtcClient;
let connected = '';
let streamers = [];

onMount(async () => {
  const id = Tools.uuidv4();

  rtcClient = new RtcClient(new URL('http://localhost:3005'), id, `${id}/client`, true);

  rtcClient.onSignallingServerConnected = () => {
    console.log('Connected to Signalling Server');
    rtcClient.sendSocketMessage(JSON.stringify({ type: 'getStreamers' }));
  };

  rtcClient.onDisconnect = (streamerId) => {
    console.log('Disconnected from Signalling Server', streamerId);
  };

  rtcClient.onMessage = (ev) => {
    if (ev.type == 'streamers') {
      streamers = ev.streamers;
    }
  };

  rtcClient.connectToSignalling();
});

const connect = async (ev: Event, streamer) => {
  ev.preventDefault();
  console.log(streamer);
  rtcClient.setStreamerId(streamer);
  await rtcClient.sendOffer();
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
<div class="col-md-9 ms-sm-auto col-lg-10 px-md-4" />
