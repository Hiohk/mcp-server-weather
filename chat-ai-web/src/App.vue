<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopHeader from '@/components/top/TopHeader.vue'
</script>

<template>
  <div class="app-container">
    <TopHeader />
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>
