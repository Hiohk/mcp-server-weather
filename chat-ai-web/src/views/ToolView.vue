<template>
  <div class="name-generator-container">
    <t-layout class="layout-container">
      <t-content class="scrollable-content">
        <t-row :gutter="[16, 16]">
          <t-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
            <div>
              <t-card class="left-card" title="Namegen">
                <div class="card-tip">
                  <t-alert theme="info" close :max-line="1">
                    <span>基于用户输入的文本，智能生成符合不同编程语言规范的英文命名，</span>
                    <span>支持多种命名风格和用途场景。</span>
                  </t-alert>
                </div>

                <div>
                  <t-form ref="formValidatorStatus" :rules="rules" :data="formData" label-align="top" :colon="true"
                    :label-width="10" @reset="onReset" @submit="onSubmit">
                    <t-form-item name="description" label="输入描述">
                      <t-textarea v-model="formData.description" placeholder="请输入文本" :maxcharacter="1000" clearable>
                      </t-textarea>
                    </t-form-item>

                    <t-divider />

                    <t-form-item name="namingStyle" label="命名风格">
                      <t-select v-model="formData.namingStyle" clearable>
                        <t-option v-for="style in namingStyles" :key="style.value" :value="style.value"
                          :label="style.label">
                          {{ style.label }}
                        </t-option>
                      </t-select>
                    </t-form-item>

                    <t-form-item name="usageType" label="用途类型">
                      <t-select v-model="formData.usageType" clearable>
                        <t-option v-for="usage in usageTypes" :key="usage.value" :value="usage.value"
                          :label="usage.label">
                          {{ usage.label }}
                        </t-option>
                      </t-select>
                    </t-form-item>

                    <t-form-item name="language" label="语言">
                      <t-select v-model="formData.language" placeholder="请选择语言" clearable>
                        <t-option v-for="item in options" :key="item.value" :value="item.value" :label="item.label">
                        </t-option>
                      </t-select>
                    </t-form-item>

                    <t-form-item name="length" label="命名长度">
                      <t-radio-group v-model="formData.length" variant="default-filled">
                        <t-radio-button value="short">简短</t-radio-button>
                        <t-radio-button value="medium">中等</t-radio-button>
                        <t-radio-button value="long">详细</t-radio-button>
                      </t-radio-group>
                    </t-form-item>

                    <t-divider />

                    <t-form-item>
                      <t-button :loading="loading" :disabled="loading" class="btn-generate" block theme="primary"
                        type="submit">
                        <template #icon>
                          <SystemSumIcon />
                        </template>
                        生成命名
                      </t-button>
                      <t-button block variant="outline" type="reset">
                        <template #icon>
                          <ClearIcon />
                        </template>
                        重置
                      </t-button>
                    </t-form-item>
                  </t-form>
                </div>
              </t-card>
            </div>
          </t-col>
          <t-col :xs="12" :sm="12" :md="8" :lg="8" :xl="8">
            <div>
              <t-card class="card-example" title="例子" :subtitle="subtitle" :style="{ width: '100%' }">
                <t-list :split="true" style="max-height: 160px">
                  <t-list-item v-for="(example, index) in examplesData" :key="index">
                    <t-list-item-meta :title="getFormatName(example)">
                      <template #description>
                        <t-check-tag class="tag-check" :checked="true" theme="primary" variant="outline">{{
                          example.language }}</t-check-tag>

                        <t-check-tag class="tag-check" :checked="true" theme="success" variant="outline">{{
                          example.namingStyle }}</t-check-tag>

                        <t-check-tag class="tag-check" :checked="true" theme="warning" variant="outline">{{
                          example.usageType }}</t-check-tag>
                      </template>
                    </t-list-item-meta>

                    <template #action>
                      <span>
                        <t-button id="copyButton" shape="square" variant="outline" @click="copyExampleResult(example)">
                          <CopyIcon />
                        </t-button>
                      </span>
                    </template>
                  </t-list-item>
                </t-list>
              </t-card>

              <t-card title="结果" :style="{ width: '100%' }">
                <t-empty v-if="showEmpty" />

                <t-list v-else :split="true" style="max-height: 370px">
                  <template #header> {{ headerText }} </template>
                  <t-list-item v-for="(example, index) in namingResultData" :key="index">
                    <t-list-item-meta :image="avatarSvg" :title="example.output">
                      <template #description>
                        <t-tag class="tag-check">{{ example.description }}</t-tag>
                        <t-check-tag class="tag-check" :checked="true" theme="primary" variant="outline">{{
                          example.language }}</t-check-tag>

                        <t-check-tag class="tag-check" :checked="true" theme="success" variant="outline">{{
                          example.namingStyle }}</t-check-tag>

                        <t-check-tag class="tag-check" :checked="true" theme="warning" variant="outline">{{
                          getUsageTypeName(example.usageType) }}</t-check-tag>
                      </template>
                    </t-list-item-meta>
                    <template #action>
                      <span>
                        <t-button id="copyButton" shape="square" variant="outline" @click="copyResult(example)">
                          <CopyIcon />
                        </t-button>
                      </span>
                    </template>
                  </t-list-item>
                </t-list>
              </t-card>
            </div>
          </t-col>
        </t-row>
      </t-content>
    </t-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import avatarSvg from '@/assets/avatar.svg'
import { sendMessage } from '@/request/index.js'
import { MessagePlugin } from 'tdesign-vue-next'
import { SystemSumIcon, ClearIcon, CopyIcon } from 'tdesign-icons-vue-next'
import dayjs from 'dayjs'
import ClipboardJS from 'clipboard';

const subtitle =
  '基于用户输入的文本，智能生成符合不同编程语言规范的英文命名，支持多种命名风格和用途场景。'

const showEmpty = ref(true);
const headerText = ref("");
const namingResultData = ref([]);

const loading = ref(false);
const customBtnLoading = ref({
  loading: false,
  showOverlay: true,
  text: '生成中...',
});

const formData = ref({
  description: '',
  namingStyle: 'camelCase',
  usageType: 'variable',
  language: 'javascript',
  length: 'medium',
})

const rules = {
  description: [{ required: true, message: '输入描述是必填项', type: 'warning' }],
  namingStyle: [{ required: true, message: '请选择命名风格', type: 'warning' }],
  usageType: [{ required: true, message: '请选择用途类型', type: 'warning' }],
  language: [{ required: true, message: '请选择语言', type: 'warning' }],
  length: [{ required: true, message: '请选择命名长度', type: 'warning' }],
};

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
    description: '用户信息管理',
    language: 'Java',
    namingStyle: 'PascalCase',
    usageType: '类名',
    output: 'UserInformationManager',
  },
  {
    description: '配置文件路径',
    language: 'Python',
    namingStyle: 'snake_case',
    usageType: '变量名',
    output: 'config_file_path',
  },
  {
    description: '用户数据接口',
    language: 'JavaScript',
    namingStyle: 'UPPER_CASE',
    usageType: '常量名',
    output: 'USER_DATA_ENDPOINT',
  },
  {
    description: '解析JSON数据',
    language: 'C++',
    namingStyle: 'camelCase',
    usageType: '函数名',
    output: 'parseJsonData',
  },
])

const onReset = () => {
  MessagePlugin.success('重置成功')
}

const onSubmit = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    showEmpty.value = false;
    headerText.value = "正在生成,请稍等...";
    loading.value = true;
    customBtnLoading.value = { ...customBtnLoading.value, loading: true };
    const result = await sendMessage({
      message: `输入：${JSON.stringify(formData.value)}-prompt: ${prompt.value}`,
    })
    MessagePlugin.success('生成完毕')
    headerText.value = `生成于${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
    loading.value = false;
    customBtnLoading.value = { ...customBtnLoading.value, loading: false }

    namingResultData.value = JSON.parse(result.response.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || '[]')
  } else {
    showEmpty.value = true;
    console.log('Validate Errors: ', firstError, validateResult)
    MessagePlugin.warning(firstError)
    loading.value = false
    customBtnLoading.value = { ...customBtnLoading.value, loading: false }
  }
}

const getFormatName = (example) => {
  return `${example.description}-${example.output}`
}

const copyExampleResult = (item) => {
  const textToCopy = typeof item.description === 'string' ? item.description : JSON.stringify(item);
  const clipboard = new ClipboardJS("#copyButton", {
    text: () => textToCopy
  });

  clipboard.on('success', () => {
    MessagePlugin.success('复制成功');
    clipboard.destroy();
  });

  clipboard.on('error', () => {
    MessagePlugin.error('复制失败，请手动复制');
    clipboard.destroy();
  });
};

const copyResult = (item) => {
  const textToCopy = typeof item.output === 'string' ? item.output : JSON.stringify(item);
  const clipboard = new ClipboardJS("#copyButton", {
    text: () => textToCopy
  });

  clipboard.on('success', () => {
    MessagePlugin.success('复制成功');
    clipboard.destroy();
  });

  clipboard.on('error', () => {
    MessagePlugin.error('复制失败，请手动复制');
    clipboard.destroy();
  });
};

const getUsageTypeName = (name) => {
  const usageTypeMap = {
    variable: '变量名',
    function: '函数/方法名',
    class: '类名',
    component: '组件名',
    file: '文件名',
    constant: '常量名',
  };
  return usageTypeMap[name] || name;
}

const prompt = ref(`
# 角色
您是一名专业的编程命名顾问，根据用户需求生成符合特定编程语言规范的英文标识符名称。

# 核心任务
基于以下用户配置生成4个最合适的命名方案：

## 输入参数说明
1. 用户描述 = "{description}"
2. 命名风格 = "{namingStyle}"（必须严格使用以下格式）：
   • camelCase → 小驼峰命名法（例：userProfile）
   • PascalCase → 大驼峰命名法（例：UserProfile）
   • snake_case → 蛇形命名法（例：user_profile）
   • kebab-case → 短横线命名法（例：user-profile）
   • UPPER_CASE → 全大写命名法（例：USER_PROFILE）
3. 用途类型 = "{usageType}"：
   • variable → 变量名（名词/形容词，例：isValid）
   • function → 函数/方法名（动词短语，例：calculateTotal）
   • class → 类名（名词+大驼峰，例：UserController）
   • component → 组件名（大驼峰+功能，例：SidebarMenu）
   • file → 文件名（小写+连字符，例：error-utils.js）
   • constant → 常量名（全大写+下划线，例：MAX_RETRIES）
4. 编程语言 = "{language}"（需遵守语言规范）：
   • JavaScript/TypeScript：变量camelCase，类PascalCase
   • Java/C#：方法camelCase，类PascalCase
   • Python：变量snake_case，类PascalCase
   • C/C++：推荐snake_case或camelCase
   • PHP：变量$camelCase，类PascalCase
   • Go：变量camelCase，导出类型PascalCase
   • Swift：变量camelCase，类型PascalCase
5. 长度要求 = "{length}"：
   • short → 1-2个单词（例：id, totalCount）
   • medium → 2-3个单词（例：userToken）
   • long → 3-4个单词（例：paymentGatewayService）

# 输出格式
输出必须是可以直接解析的不带任何格式的数组字符串：
[
  {
    "description": "原始描述文本",
    "language": "编程语言名称（如JavaScript）",
    "namingStyle": "命名风格标识（如camelCase）",
    "usageType": "用途类型中文名（如'变量名'）",
    "output": "生成的命名"
  }
]`)
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
