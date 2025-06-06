import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import TDesign from 'tdesign-vue-next';
import TDesignChat from '@tdesign-vue-next/chat'; // 引入chat组件

// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';

const app = createApp(App);

app.use(router);
app.use(TDesignChat).use(TDesign);

app.mount('#app');





