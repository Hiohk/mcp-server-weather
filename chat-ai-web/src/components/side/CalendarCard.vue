<template>
  <div class="my-calendar">
    <t-calendar
      ref="myCalendar"
      :theme="theme"
      :is-show-weekend-default="true"
      :fill-with-zero="fillWithZero"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const theme = ref('card')
const myCalendar = ref()
const fillWithZero = ref(true)
</script>

<style>
.icon {
  font-size: 32px;
  color: var(--td-brand-color);
  background: var(--td-brand-color-light);
  border-radius: var(--td-radius-medium);
  padding: 12px;
}

.my-calendar {
  width: 300px;
  margin-left: 16px;
  margin-bottom: 10px;
}

.t-calendar--card {
  width: 300px !important;
}
</style>
