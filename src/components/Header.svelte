<script type="ts">
import { Link } from 'svelte-routing';
</script>

<style>
.navbar {
  justify-content: initial;
  position: fixed;
  width: 100%;
}
.nav-item {
  float: left;
  padding: 0px 10px;
}
.navbar-nav {
  display: block;
}
</style>

<header class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
  <Link class="navbar-brand col-md-3 col-lg-2 me-0 px-3" to="/">Basic Webrtc</Link>
  <button
    class="navbar-toggler position-absolute d-md-none collapsed"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#sidebarMenu"
    aria-controls="sidebarMenu"
    aria-expanded="false"
    aria-label="Toggle navigation">
    <span class="navbar-toggler-icon" />
  </button>
  <ul class="navbar-nav px-3">
    <li class="nav-item text-nowrap">
      <Link class="nav-link" to="/">Streamer</Link>
    </li>
    <li class="nav-item text-nowrap">
      <Link class="nav-link" to="/player">Player</Link>
    </li>
  </ul>
</header>
