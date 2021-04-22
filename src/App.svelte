<script type="ts">
import { onMount } from 'svelte';
import * as Routing from 'svelte-routing';
import Layout from './components/Layout.svelte';
import Streamer from './routes/Streamer.svelte';
import Player from './routes/Player.svelte';

export let url = '';
onMount(async () => {});
</script>

<style>
.laycontainer {
  height: 100%;
  position: absolute;
  width: 100%;
  overflow: auto;
}
</style>

<Routing.Router url={url}>
  <Layout>
    <div class="justify-content-between align-items-center pt-3 pb-3 laycontainer">
      <Routing.Route path="/"><Streamer /></Routing.Route>
      <Routing.Route path="/player"><Player /></Routing.Route>
    </div>
  </Layout>
</Routing.Router>
