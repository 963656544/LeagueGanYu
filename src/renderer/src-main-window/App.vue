<template>
  <div
    id="app-frame"
    :class="{
      'use-plain-bg': !backgroundImageUrl
    }"
  >
    <SettingsModal v-model:show="isShowingSettingModal" v-model:tab-name="settingModelTab" />
    <SetupInAppScope />
    <Transition name="bg-fade">
      <div
        v-if="backgroundImageUrl"
        :key="backgroundImageUrl"
        class="background-wallpaper"
        :class="{
          'no-image': !backgroundImageUrl
        }"
        :style="{
          backgroundImage: `url('${backgroundImageUrl}')`
        }"
      ></div>
    </Transition>
    <MainWindowTitleBar />
    <div id="app-content"><RouterView /></div>
    <div v-if="as.isRabiVersion" id="version-watermark">LeagueGanYu {{ as.version }}</div>

    <NModal
      v-model:show="showFirstLaunchModal"
      preset="card"
      :mask-closable="false"
      :closable="false"
      style="width: 520px"
      title="致谢 League Akari"
    >
      <div class="first-launch-content">
        <p class="first-launch-line">
          该项目（<strong>LeagueGanYu</strong>）完全基于
          <strong>League Akari</strong> 二次开发，原项目作者付出了大量心血。
        </p>
        <p class="first-launch-line">
          如果您觉得满意，请为 ta 点一个 ⭐ Star，作为对原作者的鼓励。
        </p>
        <p class="first-launch-link" @click="openAkariRepo">
          🔗 https://github.com/LeagueAkari/LeagueAkari
        </p>
        <div class="first-launch-actions">
          <NButton type="primary" @click="confirmAkariNotice">访问并关闭</NButton>
          <NButton @click="dismissAkariNotice">仅关闭</NButton>
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import LeagueAkariSpan from '@renderer-shared/components/LeagueAkariSpan.vue'
import { useKeyboardCombo } from '@renderer-shared/compositions/useKeyboardCombo'
import { useInstance } from '@renderer-shared/shards'
import { AppCommonRenderer } from '@renderer-shared/shards/app-common'
import { useAppCommonStore } from '@renderer-shared/shards/app-common/store'
import { SetupInAppScope } from '@renderer-shared/shards/setup-in-app-scope/comp'
import { greeting } from '@renderer-shared/utils/greeting'
import { useTranslation } from 'i18next-vue'
import { NButton, NModal, useMessage, useNotification } from 'naive-ui'
import { onMounted, provide, ref } from 'vue'
import { h } from 'vue'

import SettingsModal from './components/settings-modal/SettingsModal.vue'
import MainWindowTitleBar from './components/title-bar/MainWindowTitleBar.vue'
import { MainWindowUiRenderer } from './shards/main-window-ui'

const mui = useInstance(MainWindowUiRenderer)

const as = useAppCommonStore()

const app = useInstance(AppCommonRenderer)

const { t } = useTranslation()

greeting(as.version)

const appProvide = {
  openSettingsModal: (tabName?: string) => {
    isShowingSettingModal.value = true
    if (tabName) {
      settingModelTab.value = tabName
    }
  }
}

provide('app', appProvide)

const notification = useNotification()

const isShowingSettingModal = ref(false)
const settingModelTab = ref('basic')

app.onSecondInstance(() => {
  notification.info({
    title: 'League Akari',
    content: () => t('app.singleton'),
    duration: 10000
  })
})

const message = useMessage()

useKeyboardCombo('AKARI', {
  onFinish: () => {
    message.info(() => h(LeagueAkariSpan))
  },
  requireSameEl: true,
  caseSensitive: false,
  timeout: 250
})

const backgroundImageUrl = mui.usePreferredBackgroundImageUrl()

// ===== 首啟 Akari 致謝彈窗 =====
const FIRST_LAUNCH_KEY = 'akari-credit-notice-shown'
const showFirstLaunchModal = ref(false)

function openAkariRepo() {
  window.open('https://github.com/LeagueAkari/LeagueAkari')
}

function confirmAkariNotice() {
  openAkariRepo()
  dismissAkariNotice()
}

function dismissAkariNotice() {
  localStorage.setItem(FIRST_LAUNCH_KEY, '1')
  showFirstLaunchModal.value = false
}

onMounted(() => {
  if (!localStorage.getItem(FIRST_LAUNCH_KEY)) {
    setTimeout(() => {
      showFirstLaunchModal.value = true
    }, 500)
  }
})
</script>

<style lang="less">
#app-frame {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: var(--app-min-width);
  min-height: var(--app-min-height);

  &.use-plain-bg {
    background-color: var(--background-color-primary);
  }

  > #app-content {
    z-index: 5;
    height: 0;
    flex: 1;
    overflow: hidden;
  }

  > #version-watermark {
    position: absolute;
    bottom: 8px;
    right: 16px;
    z-index: 10;
    font-size: 12px;
    opacity: 0.4;
    pointer-events: none;
  }
}

.background-wallpaper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

[data-theme='dark'] {
  .background-wallpaper::before {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.85) 75%,
      rgba(0, 0, 0, 0.85) 100%
    );
  }

  .background-wallpaper.no-image::before {
    background: none;
  }
}

[data-theme='light'] {
  .background-wallpaper::before {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.95) 75%,
      rgba(255, 255, 255, 0.95) 100%
    );
  }

  .background-wallpaper.no-image::before {
    background: none;
  }
}

.first-launch-content {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .first-launch-line {
    margin: 0;
    line-height: 1.7;
    font-size: 14px;
  }

  .first-launch-link {
    margin: 4px 0 8px;
    padding: 8px 12px;
    border-radius: 4px;
    background-color: rgba(244, 67, 54, 0.1);
    color: #ff8ab1;
    font-family: Consolas, monospace;
    font-size: 13px;
    cursor: pointer;
    border: 1px dashed rgba(244, 67, 54, 0.4);
    transition: all 0.2s;
    word-break: break-all;

    &:hover {
      background-color: rgba(244, 67, 54, 0.2);
      color: #ffc1da;
    }
  }

  .first-launch-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
}

.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 0.3s;
}

.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}

.bg-fade-enter-to,
.bg-fade-leave-from {
  opacity: 1;
}
</style>
