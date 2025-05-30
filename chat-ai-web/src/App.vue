<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopHeader from '@/components/top/TopHeader.vue'
</script>

<template>
  <div class="app-container">
    <t-layout>
      <t-header>
        <TopHeader />
      </t-header>

      <t-content>
        <RouterView />
      </t-content>
      <t-footer>Copyright @ 2025-{{ new Date().getFullYear() }} HKGroup. All Rights Reserved</t-footer>
    </t-layout>
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
