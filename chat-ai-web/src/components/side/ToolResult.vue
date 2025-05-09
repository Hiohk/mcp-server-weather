<template>
  <div>
    <t-card
      v-for="(item, index) in toolList"
      :key="index"
      class="tool-result-card"
      :title="item.name"
      hover-shadow
      :style="{ width: '300px', marginLeft: '16px' }"
    >
      <div v-html="renderedMarkdown(item.result.content[0].text)"></div>
      <template #actions>
        <a href="javascript:void(0)" @click="clickHandler">复制</a>
      </template>
    </t-card>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import markdownit from 'markdown-it'

const props = defineProps({
  toolResultList: {
    type: Array,
    default: () => [],
  },
})

const md = markdownit()
const toolList = ref([])

const clickHandler = () => {
  MessagePlugin.success('复制成功')
}

watch(
  () => props.toolResultList,
  (newVal, oldVal) => {
    // console.log('newVal', newVal)
    if (newVal) {
      toolList.value = newVal
    }
  },
)

const renderedMarkdown = (markdownString) => {
  return md.render(markdownString)
}
</script>
