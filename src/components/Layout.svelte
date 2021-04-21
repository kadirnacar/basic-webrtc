<script type="ts">
import Header from './Header.svelte';
</script>

<style>
.container-fluid {
  margin-top: 48px;
}
.content {
  position: absolute;
  height: calc(100% - 48px);
  width: 100%;
  padding: 0 !important;
}
</style>

<Header />
<div class="container-fluid">
  <div class="row">
    <div class="px-md-4 content">
      <!-- <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4"> -->
      <slot />
    </div>
  </div>
</div>
