<template>
  <div class="chat-box">
    <t-chat
      ref="chatRef"
      clear-history
      :data="chatList"
      :text-loading="loading"
      :is-stream-load="isStreamLoad"
      style="height: 600px"
      @scroll="handleChatScroll"
      @clear="clearConfirm"
    >
      <!-- eslint-disable vue/no-unused-vars -->
      <template #content="{ item, index }">
        <t-chat-reasoning v-if="item.reasoning?.length > 0" expand-icon-placement="right">
          <template #header>
            <t-chat-loading v-if="isStreamLoad" text="思考中..." indicator />
            <div v-else style="display: flex; align-items: center">
              <CheckCircleIcon
                style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px"
              />
              <span>已深度思考</span>
            </div>
          </template>
          <t-chat-content
            v-if="item.reasoning.length > 0"
            :content="item.reasoning"
            variant="base"
          />
        </t-chat-reasoning>
        <t-chat-content v-if="item.content.length > 0" :content="item.content" variant="base" />
      </template>
      <template #actions="{ item, index }">
        <t-chat-action
          :content="item.content"
          :operation-btn="['good', 'bad', 'replay', 'copy']"
          @operation="handleOperation"
        />
      </template>
      <template #footer>
        <t-chat-sender
          ref="chatSenderRef"
          class="chat-sender"
          :stop-disabled="loading"
          :textarea-props="{
            placeholder: '请输入消息...',
          }"
          @send="inputEnter"
          @stop="onStop"
        >
          <template #prefix>
            <div class="model-select">
              <t-tooltip v-model:visible="allowToolTip" content="切换模型" trigger="hover">
                <t-select
                  v-model="selectValue"
                  :options="selectOptions"
                  value-type="object"
                  @focus="allowToolTip = false"
                ></t-select>
              </t-tooltip>
              <t-button
                class="check-box"
                :class="{ 'is-active': isChecked }"
                variant="text"
                @click="checkClick"
              >
                <ToolsIcon />
                <span>MCP 工具</span>
              </t-button>
            </div>
          </template>
        </t-chat-sender>
      </template>
    </t-chat>
    <t-button v-show="isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
      <div class="to-bottom">
        <ArrowDownIcon />
      </div>
    </t-button>
  </div>
</template>
<script setup lang="jsx">
import { ref } from 'vue'
import { ArrowDownIcon, CheckCircleIcon } from 'tdesign-icons-vue-next'
import { sendMessage } from '@/request/index.js'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

import { ToolsIcon } from 'tdesign-icons-vue-next'
const allowToolTip = ref(false)
const chatSenderRef = ref(null)
const selectOptions = [
  {
    label: '默认模型',
    value: 'default',
  },
  {
    label: 'THUDM/GLM-4-9B-0414',
    value: 'THUDM/GLM-4-9B-0414',
  },
  {
    label: 'DeepSeek-V3',
    value: 'DeepSeek-V3',
  },
]
const selectValue = ref({
  label: '默认模型',
  value: 'default',
})
const isChecked = ref(false)
const checkClick = () => {
  isChecked.value = !isChecked.value
}

const fetchCancel = ref(null)
const loading = ref(false)
// 流式数据加载中
const isStreamLoad = ref(false)

const chatRef = ref(null)
const isShowToBottom = ref(false)
// 滚动到底部
const backBottom = () => {
  chatRef.value.scrollToBottom({
    behavior: 'smooth',
  })
}
// 是否显示回到底部按钮
const handleChatScroll = function ({ e }) {
  const scrollTop = e.target.scrollTop
  isShowToBottom.value = scrollTop < 0
}
// 清空消息
const clearConfirm = function () {
  chatList.value = []
}
const handleOperation = function (type, options) {
  console.log('handleOperation', type, options)
}
// 倒序渲染
const chatList = ref([
  {
    content: `Qwen/QwQ-32B大模型提供支持</span>`,
    role: 'model-change',
    reasoning: '',
  },
  {
    avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
    name: 'Chat AI',
    datetime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    reasoning: '',
    content: '✨ 您好！欢迎来到「Chat AI」的对话世界！ 你可以询问我天气信息✨',
    role: 'assistant',
    duration: 10,
  },
  {
    avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
    name: '用户',
    datetime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    content: '嗨！你好',
    role: 'user',
    reasoning: '',
  },
])

const onStop = function () {
  if (fetchCancel.value) {
    fetchCancel.value.controller.close()
    loading.value = false
    isStreamLoad.value = false
  }
}

const inputEnter = function (inputValue) {
  if (isStreamLoad.value) {
    return
  }
  if (!inputValue) return
  const params = {
    avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
    name: '用户',
    datetime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    content: inputValue,
    role: 'user',
  }
  chatList.value.unshift(params)
  // 空消息占位
  const params2 = {
    avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
    name: 'Chat AI',
    datetime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    content: '',
    reasoning: '',
    role: 'assistant',
  }
  chatList.value.unshift(params2)
  handleData(inputValue)
}

const fetchSSE = async (fetchFn, options) => {
  const response = await fetchFn()
  const { success, fail, complete } = options
  // 如果不 ok 说明有请求错误
  if (!response.ok) {
    complete?.(false, response.statusText)
    fail?.()
    return
  }
  const reader = response?.body?.getReader()
  const decoder = new TextDecoder()
  if (!reader) return

  reader.read().then(function processText({ done, value }) {
    if (done) {
      // 正常的返回
      complete?.(true)
      return
    }
    const chunk = decoder.decode(value, { stream: true })
    const buffers = chunk.toString().split(/\r?\n/)
    const jsonData = JSON.parse(buffers)
    success(jsonData)
    reader.read().then(processText)
  })
}
const handleData = async (chatString) => {
  console.log('handleData', chatString)
  loading.value = true
  isStreamLoad.value = true
  const lastItem = chatList.value[0]

  const result = await sendMessage({
    message: chatString,
    // sessionId: uuidv4(),
  })

  console.log('----->', result)

  chatList.value.shift()
  chatList.value.unshift({
    avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
    name: 'Chat AI',
    datetime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    content: result.response.choices[0].message.content,
    reasoning: '',
    role: 'assistant',
  })

  // 显示用时xx秒，业务侧需要自行处理
  lastItem.duration = 20
  // 控制终止按钮
  isStreamLoad.value = false
  loading.value = false
}
</script>
<style lang="less">
/* 应用滚动条样式 */
::-webkit-scrollbar-thumb {
  background-color: var(--td-scrollbar-color);
}

::-webkit-scrollbar-thumb:horizontal:hover {
  background-color: var(--td-scrollbar-hover-color);
}

::-webkit-scrollbar-track {
  background-color: var(--td-scroll-track-color);
}

.chat-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0 auto;
  max-width: 1280px;
  width: 80%;

  .bottomBtn {
    position: absolute;
    left: 50%;
    margin-left: -20px;
    bottom: 210px;
    padding: 0;
    border: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-shadow:
      0px 8px 10px -5px rgba(0, 0, 0, 0.08),
      0px 16px 24px 2px rgba(0, 0, 0, 0.04),
      0px 6px 30px 5px rgba(0, 0, 0, 0.05);
  }

  .to-bottom {
    width: 40px;
    height: 40px;
    border: 1px solid #dcdcdc;
    box-sizing: border-box;
    background: var(--td-bg-color-container);
    border-radius: 50%;
    font-size: 24px;
    line-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    .t-icon {
      font-size: 24px;
    }
  }
}

.model-select {
  display: flex;
  align-items: center;

  .t-select {
    width: 112px;
    height: 32px;
    margin-right: 8px;

    .t-input {
      border-radius: 32px;
      padding: 0 15px;
    }
  }

  .check-box {
    width: 112px;
    height: 32px;
    border-radius: 32px;
    border: 0;
    background: #e7e7e7;
    color: rgba(0, 0, 0, 0.9);
    box-sizing: border-box;
    flex: 0 0 auto;

    .t-button__text {
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        margin-left: 4px;
      }
    }
  }

  .check-box.is-active {
    border: 1px solid #d9e1ff;
    background: #f2f3ff;
    color: var(--td-brand-color);
  }
}

.chat-sender {
  .btn {
    color: var(--td-text-color-disabled);
    border: none;

    &:hover {
      color: var(--td-brand-color-hover);
      border: none;
      background: none;
    }
  }

  .btn.t-button {
    height: var(--td-comp-size-m);
    padding: 0;
  }

  .model-select {
    display: flex;
    align-items: center;

    .t-select {
      width: 112px;
      height: var(--td-comp-size-m);
      margin-right: var(--td-comp-margin-s);

      .t-input {
        border-radius: 32px;
        padding: 0 15px;
      }

      .t-input.t-is-focused {
        box-shadow: none;
      }
    }

    .check-box {
      width: 112px;
      height: var(--td-comp-size-m);
      border-radius: 32px;
      border: 0;
      background: var(--td-bg-color-component);
      color: var(--td-text-color-primary);
      box-sizing: border-box;
      flex: 0 0 auto;

      .t-button__text {
        display: flex;
        align-items: center;
        justify-content: center;

        span {
          margin-left: var(--td-comp-margin-xs);
        }
      }
    }

    .check-box.is-active {
      border: 1px solid var(--td-brand-color-focus);
      background: var(--td-brand-color-light);
      color: var(--td-text-color-brand);
    }
  }
}
</style>
