<script type="ts">
  import { onDestroy, onMount } from 'svelte';
  import { uuidv4 } from '../../tools';
  import Sidebar from '../components/Sidebar.svelte';
  import { RtcConnection } from '../lib/RtcConnection';
  
  let videoElement: HTMLVideoElement;
  let rtcConn: RtcConnection;
  let clientId: string;
  let clients: any[] = [];
  
  onMount(async () => {
    console.log(window.location)
    rtcConn = new RtcConnection(`ws://${window.location.hostname}:3005?clientId=${uuidv4()}&type=player`);
    rtcConn.onMessage = (msg) => {
      if (msg.type === 'clients') {
        console.log(msg.data);
        clients = msg.data.filter((x) => x.clientId !== clientId);
      }
    };
    await rtcConn.connectServer();
    clientId = rtcConn.getClientId();
    rtcConn.onReceiveStream = (peerId, stream) => {
      rtcConn.addMediaStream(stream);
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.play();
    };
  });
  
  onDestroy(() => {
    rtcConn.disconnectServer();
  });
  
  const connectStreamer = async (streamer) => {
    await rtcConn.connectToPeer(streamer.clientId);
  };
  </script>
  
  <style>
  </style>
  
  <Sidebar>
    <li class="nav-item">
      <a
        class={`nav-link btn btn-light`}
        aria-current="page"
        href="/"
        on:click={(e) => {
          e.preventDefault();
        }}>
        <span data-feather="home" />
        {clientId}
      </a>
    </li>
    {#each clients as client}
      <li class="nav-item">
        <a
          class={`nav-link btn btn-primary`}
          aria-current="page"
          href="/"
          on:click={(e) => {
            e.preventDefault();
            connectStreamer(client);
          }}>
          <span data-feather="home" />
          {client.type}
          {client.clientId}
        </a>
      </li>
    {/each}
  </Sidebar>
  <div class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
    <video bind:this={videoElement} controls={false} muted />
  </div>
  