<script setup>
import ChatComponent from '@/components/ChatComponent.vue'
</script>

<template>
  <div class="home-view">
    <t-layout class="layout-container">
      <t-header class="fixed-header">
        <t-head-menu theme="light" value="item1" height="120px">
          <template #logo>
            <img width="136" class="logo" src="https://www.tencent.com/img/index/menu_logo_hover.png" alt="logo" />
          </template>
          <t-menu-item value="item1"> 首页 </t-menu-item>
          <t-menu-item value="item2"> 博客 </t-menu-item>
          <t-menu-item value="item3"> 关于 </t-menu-item>
          <template #operations>
            <a href="javascript:;"><t-icon class="t-menu__operations-icon" name="search" /></a>
            <a href="javascript:;"><t-icon class="t-menu__operations-icon" name="notification-filled" /></a>
            <a href="javascript:;"><t-icon class="t-menu__operations-icon" name="home" /></a>
          </template>
        </t-head-menu>
      </t-header>
      <t-content class="scrollable-content">
        <div>
          <ChatComponent />
        </div>
      </t-content>
    </t-layout>
  </div>
</template>

<style scoped>
.home-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

/* Header 固定在顶部 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

/* Content 区域可滚动 */
.scrollable-content {
  display: flex;
  flex-direction: column;
  margin: 70px 5% 10px;
  height: 100%;
  overflow: hidden;
}
</style>
