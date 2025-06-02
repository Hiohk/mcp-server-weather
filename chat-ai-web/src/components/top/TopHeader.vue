<template>
  <div class="header-container">
    <t-header class="fixed-header">
      <t-head-menu theme="light" :value="activeValue" height="120px" @change="handleMenuChange">
        <template #logo>
          <img width="40" class="logo" src="@/assets/logo.svg" alt="logo" />
        </template>
        <t-menu-item value="home"> 首页 </t-menu-item>
        <t-menu-item value="tool"> 工具 </t-menu-item>
        <t-menu-item value="about"> 关于 </t-menu-item>
        <template #operations>
          <t-button class="btn-login" shape="square" variant="text">
            <t-icon class="t-menu__operations-icon" name="login" />
          </t-button>
        </template>
      </t-head-menu>
    </t-header>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeValue = ref('home')

const handleMenuChange = (value) => {
  switch (value) {
    case 'home':
      router.push({ name: 'home' })
      activeValue.value = 'home'
      break
    case 'tool':
      router.push({ name: 'tool' })
      activeValue.value = 'tool'
      break
    case 'about':
      router.push({ name: 'about' })
      activeValue.value = 'about'
      break
    default:
      break
  }
}
</script>

<style scoped>
.header-container {
  position: relative;
  z-index: 1;
}

/* Header 固定在顶部 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.t-menu__operations-icon {
  margin: 0 auto;
}
</style>
