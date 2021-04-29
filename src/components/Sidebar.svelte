<script type="ts">
</script>

<style>
  .sidebar{
    position: fixed;
    padding: initial;
    left: 0;
    top: 48px;
  }
</style>

<nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
  <div class="position-sticky pt-3">
    <ul class="nav flex-column">
      <slot />
    </ul>
  </div>
</nav>
