<template>
	<div class="page-frame" id="home" :ref="bind('page')" value="home">
		<div class="box" id="home-content" :ref="bind('content')">
			<div class="text" id="home-title">YAMI RPG EDITOR (Open Yami)</div>
			<div class="text" id="home-version" :ref="bind('version')"></div>
			<div class="box" id="home-start-list" @click="onHomeStartClick">
				<div class="item home-list-label" id="home-start-label">
					{{ t('components.home-start-label.content') }}
				</div>
				<div class="item home-start-item" id="home-start-new" value="new">
					{{ t('components.home-start-new.content') }}
				</div>
				<div class="item home-start-item" id="home-start-open" value="open">
					{{ t('components.home-start-open.content') }}
				</div>
			</div>
			<HomeRecentList />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { homeNodes } from '@app/composables/page-shell-nodes';
import { getLazyWindow } from '@app/tools/window-registry';
import HomeRecentList from '@app/components/layout/HomeRecentList.vue';

const { t } = useI18n();

const { bind } = homeNodes.scoped();

const loadCluster = () => import('@app/tools/window-cluster');
const Home = getLazyWindow('home', () => loadCluster().then((m) => m.Home));

const onHomeStartClick = (event: PointerEvent) => {
	Home?.startClick?.(event);
};
</script>
