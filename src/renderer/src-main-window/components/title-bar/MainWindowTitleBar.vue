<template>
  <div id="app-title-bar">
    <span class="app-name" v-if="as.isAdministrator">{{ t('appName') }} X</span>
    <span class="app-name" v-else>{{ t('appName') }}</span>
    <span
      class="akari-credit"
      title="该项目完全基于 League Akari 二次开发，点击访问其 GitHub 仓库"
      @click="openAkari"
    >
      ❤ 基于 League Akari（已 fork 为 LeagueGanYu）
    </span>
    <div class="divider" :class="{ invisible: !shouldShowDivider }" />
    <div class="shard-area">
      <Transition name="fade">
        <KeepAlive>
          <MatchHistoryTabsTitle v-if="$route.name === 'match-history'" />
          <OngoingGameTitle v-else-if="$route.name === 'ongoing-game'" />
        </KeepAlive>
      </Transition>
    </div>
    <div class="divider" :class="{ invisible: !shouldShowDivider }" />
    <CommonButtons />
    <div class="divider" />
    <TrafficButtons />
  </div>
</template>

<script setup lang="ts">
import { useAppCommonStore } from '@renderer-shared/shards/app-common/store'
import { useLeagueClientStore } from '@renderer-shared/shards/league-client/store'
import { useOngoingGameStore } from '@renderer-shared/shards/ongoing-game/store'
import { useTranslation } from 'i18next-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useMatchHistoryTabsStore } from '@main-window/shards/match-history-tabs/store'

import CommonButtons from './CommonButtons.vue'
import MatchHistoryTabsTitle from './MatchHistoryTabsTitle.vue'
import OngoingGameTitle from './OngoingGameTitle.vue'
import TrafficButtons from './TrafficButtons.vue'

const as = useAppCommonStore()
const route = useRoute()

const lcs = useLeagueClientStore()
const ogs = useOngoingGameStore()
const mhs = useMatchHistoryTabsStore()

const { t } = useTranslation('common')

function openAkari() {
  window.open('https://github.com/963656544/LeagueGanYu')
}

const shouldShowDivider = computed(() => {
  switch (route.name) {
    case 'match-history':
      return lcs.isConnected && mhs.tabs.length

    case 'ongoing-game':
      const isCsSpectateWait =
        lcs.champSelect.session &&
        lcs.champSelect.session.isSpectating &&
        Object.values(ogs.teams).flat().length === 0

      return ogs.queryStage.phase !== 'unavailable' && !isCsSpectateWait
    default:
      return false
  }
})
</script>

<style lang="less" scoped>
#app-title-bar {
  display: flex;
  position: relative;
  height: var(--title-bar-height);
  align-items: center;
  -webkit-app-region: drag;
  backdrop-filter: blur(8px);
  background-color: #0001;
  z-index: 1000000;
}

.shard-area {
  height: 100%;
  width: 0;
  flex: 1;
}

.app-name {
  padding: 0 4px;
  font-family: 'Comfortaa', sans-serif;
  font-weight: bold;
  margin-left: 8px;
}

.akari-credit {
  margin-left: 10px;
  padding: 2px 8px;
  font-size: 11px;
  border-radius: 9px;
  cursor: pointer;
  -webkit-app-region: no-drag;
  background-color: rgba(244, 67, 54, 0.15);
  color: #f48fb1;
  border: 1px solid rgba(244, 67, 54, 0.3);
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background-color: rgba(244, 67, 54, 0.3);
    color: #ffc1da;
  }
}

[data-theme='dark'] {
  .app-name {
    color: rgba(255, 255, 255, 0.8);
  }
}

[data-theme='light'] {
  .app-name {
    color: rgba(0, 0, 0, 0.8);
  }

  .akari-credit {
    color: #c62828;

    &:hover {
      color: #b71c1c;
    }
  }
}

.divider {
  width: 1px;
  height: 40%;
  box-sizing: border-box;
  margin: 0 8px;
  background-color: rgba(255, 255, 255, 0.15);

  &.invisible {
    visibility: hidden;
  }
}

[data-theme='dark'] {
  .divider {
    background-color: rgba(255, 255, 255, 0.15);
  }
}

[data-theme='light'] {
  .divider {
    background-color: rgba(0, 0, 0, 0.15);
  }
}
</style>
