<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopHeader from '@/components/top/TopHeader.vue'
</script>

<template>
  <div>
    <TopHeader />
    <RouterView />
  </div>
</template>
