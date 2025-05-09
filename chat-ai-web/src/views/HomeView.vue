<template>
  <div class="home-view">
    <t-layout class="layout-container">
      <t-header class="fixed-header">
        <t-head-menu theme="light" value="item1" height="120px">
          <template #logo>
            <img width="40" class="logo" src="@/assets/logo.svg" alt="logo" />
          </template>
          <t-menu-item value="item1"> 首页 </t-menu-item>
          <t-menu-item value="item2"> 博客 </t-menu-item>
          <t-menu-item value="item3"> 关于 </t-menu-item>
          <template #operations>
            <a href="javascript:;"
              ><t-icon class="t-menu__operations-icon" name="notification-filled"
            /></a>
            <a href="javascript:;"><t-icon class="t-menu__operations-icon" name="login" /></a>
          </template>
        </t-head-menu>
      </t-header>
      <t-content class="scrollable-content">
        <t-row>
          <t-col flex="auto">
            <div><ChatComponent @getToolResult="getToolResult" /></div>
          </t-col>
          <t-col flex="none">
            <div>
              <CalendarCard></CalendarCard>
              <ToolResult :toolResultList="toolResultList"></ToolResult>
            </div>
          </t-col>
        </t-row>
      </t-content>
    </t-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatComponent from '@/components/ChatComponent.vue'
import ToolResult from '@/components/side/ToolResult.vue'
import CalendarCard from '@/components/side/CalendarCard.vue'

const toolResultList = ref([])

const getToolResult = (data) => {
  toolResultList.value = data
}
</script>

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
  margin: 70px 20px 10px;
  height: 100%;
  overflow: hidden;
}
</style>
