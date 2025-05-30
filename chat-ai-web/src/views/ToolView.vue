<template>
  <div class="name-generator-container">
    <t-layout class="layout-container">
      <t-content class="scrollable-content">
        <t-row>
          <t-col :xs="10" :sm="8" :md="6" :lg="4" :xl="2">
            <div>
              <t-card class="left-card" title="Namegen">
                <div class="card-tip">
                  <t-alert theme="info" close :max-line="1">
                    <span>基于用户输入的文本，智能生成符合不同编程语言规范的英文命名，</span>
                    <span>支持多种命名风格和用途场景。</span>
                  </t-alert>
                </div>

                <div>
                  <t-form
                    ref="form"
                    :data="formData"
                    label-align="top"
                    :colon="true"
                    :label-width="10"
                    @reset="onReset"
                    @submit="onSubmit"
                  >
                    <t-form-item name="text" label="输入描述">
                      <t-textarea
                        v-model="formData.text"
                        placeholder="请输入文本"
                        :maxcharacter="1000"
                        clearable
                      >
                      </t-textarea>
                    </t-form-item>

                    <t-divider />

                    <t-form-item label="命名风格">
                      <t-select v-model="formData.namingStyle" clearable>
                        <t-option
                          v-for="style in namingStyles"
                          :key="style.value"
                          :value="style.value"
                          :label="style.label"
                        >
                          {{ style.label }}
                        </t-option>
                      </t-select>
                    </t-form-item>

                    <t-form-item label="用途类型">
                      <t-select v-model="formData.usageType" clearable>
                        <t-option
                          v-for="usage in usageTypes"
                          :key="usage.value"
                          :value="usage.value"
                          :label="usage.label"
                        >
                          {{ usage.label }}
                        </t-option>
                      </t-select>
                    </t-form-item>

                    <t-form-item name="language" label="语言">
                      <t-select v-model="formData.language" placeholder="请选择语言" clearable>
                        <t-option
                          v-for="item in options"
                          :key="item.value"
                          :value="item.value"
                          :label="item.label"
                        >
                        </t-option>
                      </t-select>
                    </t-form-item>

                    <t-form-item label="命名长度">
                      <t-radio-group v-model="formData.length" variant="default-filled">
                        <t-radio-button value="short">简短</t-radio-button>
                        <t-radio-button value="medium">中等</t-radio-button>
                        <t-radio-button value="long">详细</t-radio-button>
                      </t-radio-group>
                    </t-form-item>

                    <t-divider />

                    <t-form-item>
                      <t-button class="btn-generate" block theme="primary" type="submit">
                        <template #icon><SystemSumIcon /></template>
                        生成命名
                      </t-button>
                      <t-button block variant="outline" type="reset">
                        <template #icon><ClearIcon /></template>
                        重置
                      </t-button>
                    </t-form-item>
                  </t-form>
                </div>
              </t-card>
            </div>
          </t-col>
          <t-col :xs="2" :sm="4" :md="6" :lg="8" :xl="10">
            <div>
              <t-card
                class="card-example"
                title="例子"
                :subtitle="subtitle"
                :style="{ width: '100%' }"
              >
                <t-list :split="true">
                  <t-list-item v-for="(example, index) in examplesData" :key="index">
                    <t-list-item-meta :title="getFormatName(example)">
                      <template #description>
                        <t-check-tag
                          class="tag-check"
                          :checked="true"
                          theme="primary"
                          variant="outline"
                          >{{ example.language }}</t-check-tag
                        >

                        <t-check-tag
                          class="tag-check"
                          :checked="true"
                          theme="success"
                          variant="outline"
                          >{{ example.style }}</t-check-tag
                        >

                        <t-check-tag
                          class="tag-check"
                          :checked="true"
                          theme="warning"
                          variant="outline"
                          >{{ example.purpose }}</t-check-tag
                        >
                      </template>
                    </t-list-item-meta>

                    <template #action>
                      <span>
                        <t-button shape="square" variant="outline"><CopyIcon /></t-button>
                      </span>
                    </template>
                  </t-list-item>
                </t-list>
              </t-card>

              <t-card title="结果" subtitle="33333" :style="{ width: '100%' }"> results </t-card>
            </div>
          </t-col>
        </t-row>
      </t-content>
    </t-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const subtitle =
  '基于用户输入的文本，智能生成符合不同编程语言规范的英文命名，支持多种命名风格和用途场景。'

import { MessagePlugin } from 'tdesign-vue-next'
import { SystemSumIcon, ClearIcon, CopyIcon } from 'tdesign-icons-vue-next'

const formData = ref({
  description: '',
  namingStyle: 'camelCase',
  usageType: 'variable',
  language: '',
  length: 'medium',
})

// 命名风格选项
const namingStyles = ref([
  { value: 'camelCase', label: '小驼峰命名法 (userInfo)' },
  { value: 'PascalCase', label: '大驼峰命名法 (UserInfo)' },
  { value: 'snake_case', label: '蛇形命名法 (user_info)' },
  { value: 'kebab-case', label: '短横线命名法 (user-info)' },
  { value: 'UPPER_CASE', label: '全大写命名法 (USER_INFO)' },
])

// 用途类型选项
const usageTypes = ref([
  { value: 'variable', label: '变量名' },
  { value: 'function', label: '函数/方法名' },
  { value: 'class', label: '类名' },
  { value: 'component', label: '组件名' },
  { value: 'file', label: '文件名' },
  { value: 'constant', label: '常量名' },
])

const options = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'swift', label: 'Swift' },
]

const examplesData = ref([
  {
    input: '用户信息管理',
    language: 'Java',
    style: 'PascalCase',
    purpose: '类名',
    output: 'UserInformationManager',
  },
  {
    input: '配置文件路径',
    language: 'Python',
    style: 'snake_case',
    purpose: '变量名',
    output: 'config_file_path',
  },
  {
    input: '用户数据接口',
    language: 'JavaScript',
    style: 'UPPER_CASE',
    purpose: '常量名',
    output: 'USER_DATA_ENDPOINT',
  },
  {
    input: '解析JSON数据',
    language: 'C++',
    style: 'camelCase',
    purpose: '函数名',
    output: 'parseJsonData',
  },
])

const onReset = () => {
  MessagePlugin.success('重置成功')
}

const onSubmit = ({ validateResult, firstError }) => {
  if (validateResult === true) {
    MessagePlugin.success('提交成功')
  } else {
    console.log('Validate Errors: ', firstError, validateResult)
    MessagePlugin.warning(firstError)
  }
}

const getFormatName = (example) => {
  return `${example.input}-${example.output}`
}
</script>

<style scoped>
.name-generator-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.layout-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.scrollable-content {
  display: flex;
  flex-direction: column;
  margin: 70px 20px 10px;
  height: 100%;
}

.left-card {
  margin-right: 15px;
  /* height: 100vh; */
}

:deep(.t-card__body) {
  padding-top: 0;
}

:deep(.t-form__item) {
  margin-bottom: 10px;
}

.card-tip {
  margin-bottom: 10px;
}

.btn-generate {
  margin-right: 5px;
}

.card-example {
  margin-bottom: 15px;
}

.tag-check {
  margin-right: 5px;
}
</style>
