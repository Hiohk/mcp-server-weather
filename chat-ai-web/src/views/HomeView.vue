<template>
  <div class="home-view">
    <t-layout class="layout-container">
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

/* Content 区域可滚动 */
.scrollable-content {
  display: flex;
  flex-direction: column;
  margin: 70px 20px 10px;
  height: 100%;
  overflow: hidden;
}

.t-menu__operations-icon {
  margin: 0 auto;
}

.btn-login {
  margin: 0 10px;
}
</style>
