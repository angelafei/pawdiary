<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #FAF7F2;
  color: #3D2B1F;
  min-height: 100vh;
}

.app {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #FAF7F2;
}
</style>
