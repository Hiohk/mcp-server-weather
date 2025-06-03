<template>
  <div class="about-container">
    <t-layout class="layout-container">
      <t-content class="scrollable-content">
        <t-card class="about-card">
          <img class="img-bg" :src="aboutPic" alt="暂无图片">

          <div class="section-intro">
            <h2 class="title-primary">Hi, I'm Dennis</h2>
            <p class="text-muted">全栈开发者 & AI 技术爱好者，专注于构建智能交互产品</p>
            <p class="text-body">本项目是一个基于 AI 的智能聊天 web 应用，集成了对话交互、工具调用和智能生成能力，旨在为用户提供更自然的人机交互体验</p>
          </div>

          <t-divider />

          <div class="section-tech">
            <h3 class="title-secondary">核心技术栈</h3>
            <div class="tech-tags">
              <t-tag variant="outline" theme="success">Vue 3</t-tag>
              <t-tag variant="outline" theme="primary">Node.js</t-tag>
              <t-tag variant="outline" theme="warning">TDesign vue next</t-tag>
            </div>
          </div>

          <t-divider />

          <div class="section-contact">
            <h3 class="title-secondary">友链</h3>
            <div class="contact-links">
              <div>知识站点：
                <t-link theme="primary" hover="color" href="https://hiohk.github.io/knowledge-map/" target="_blank">
                  <template #suffix-icon>
                    <jump-icon />
                  </template>
                  knowledge map
                </t-link>
              </div>
            </div>
          </div>
          <t-divider />
          <div>
            <span class="status-title">网站运行状态：</span>
            <t-link theme="success" hover="color" href="https://stats.uptimerobot.com/sjGdkhkSal" target="_blank">
              <template #suffix-icon>
                <jump-icon />
              </template>
              服务状态
            </t-link>
          </div>
        </t-card>
      </t-content>
    </t-layout>
  </div>
</template>

<script setup>
import aboutPic from '@/assets/about_bg.jpeg'
import { JumpIcon } from 'tdesign-icons-vue-next';
</script>

<style scoped>
.about-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.scrollable-content {
  display: flex;
  flex-direction: column;
  margin: 70px 20px 10px;
  height: calc(100% - 70px);
}

.img-bg {
  width: 100%;
  height: 200px;
  /* 适当增加图片高度 */
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* 文字内容样式 */
.title-primary {
  color: #1d2129;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.text-muted {
  color: #657380;
  font-size: 14px;
  margin-bottom: 16px;
}

.text-body {
  color: #333;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.title-secondary {
  color: #1d2129;
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 16px;
}

/* 技术标签样式 */
.tech-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 联系方式样式 */
.contact-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}

.contact-item:hover {
  color: #2b85e4;
  /* TDesign 主色 */
}

.contact-icon {
  font-size: 20px;
}

.status-title {
  color: #637189;
}
</style>
