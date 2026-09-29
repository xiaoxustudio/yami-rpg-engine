<template>
	<div class="page-frame" id="home" :ref="registryRef(titleEls, 'home')" value="home">
		<div class="box" id="home-content" :ref="registryRef(titleEls, 'home-content')">
			<div class="text" id="home-title">YAMI RPG EDITOR (Open Yami)</div>
			<div class="text" id="home-version" :ref="registryRef(moduleEls, 'home-version')"></div>
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
import { titleEls } from '@app/title/element-registry';
import { moduleEls } from '@app/module/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { getLazyWindow } from '@app/tools/window-registry';
import HomeRecentList from '@app/components/layout/HomeRecentList.vue';

const { t } = useI18n();

const loadCluster = () => import('@app/tools/window-cluster');
const Home = getLazyWindow('home', () => loadCluster().then((m) => m.Home));

const onHomeStartClick = (event: PointerEvent) => {
	Home?.startClick?.(event);
};
</script>
