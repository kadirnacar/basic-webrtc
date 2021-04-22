<script type="ts">
import { onMount } from 'svelte';
import Sidebar from '../components/Sidebar.svelte';

onMount(async () => {});
</script>

<style>
</style>
<Sidebar>
  <li class="nav-item">
    <a
      class={`nav-link active`}
      aria-current="page"
      href="/"
      on:click={(ev) => {
        ev.preventDefault();
      }}>
      <span data-feather="home" />
      Home
    </a>
  </li>
</Sidebar>
<div class="col-md-9 ms-sm-auto col-lg-10 px-md-4" >
</div>
