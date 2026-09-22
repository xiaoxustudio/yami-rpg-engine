<template>
	<div
		class="box"
		id="home-recent-list"
		tabindex="-1"
		@click="onRecentClick"
		@pointerup="onRecentPointerup"
	>
		<div class="item home-list-label" id="home-recent-label">
			{{ t('components.home-recent-label.content') }}
		</div>
		<div
			v-for="(card, index) in cards"
			:key="index"
			class="item home-recent-item"
			:value="index"
			:class="{ disabled: card.disabled }"
			v-show="!card.hidden"
		>
			<div class="box home-recent-bar">
				<div class="home-recent-title text">{{ card.title }}</div>
				<div class="home-recent-date text">{{ card.dateText }}</div>
			</div>
			<div class="home-recent-path text">{{ card.pathText }}</div>
			<div class="box home-recent-stat">
				<div v-for="(text, i) in card.stats" :key="i" class="home-recent-data text">
					{{ text }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Home, type HomeRecentCard } from '@app/title/home-page.ts';

// R2b 迁移⑥：标签文案改由模板 t() 承担（原先靠本地化器写 textContent）
const { t } = useI18n();

const cards = ref<HomeRecentCard[]>([]);

const refresh = () => {
	cards.value = Home.recentCards ? [...Home.recentCards] : [];
};

const onRecentClick = (event: PointerEvent) => {
	Home?.recentClick?.(event);
};

const onRecentPointerup = (event: PointerEvent) => {
	Home?.recentPointerup?.(event);
};

onMounted(() => {
	refresh();
	window.addEventListener('home-recent-update', refresh);
});

onBeforeUnmount(() => {
	window.removeEventListener('home-recent-update', refresh);
});
</script>

<style>
/* 样式迁移：由 Project/css/layout.css 迁入组件（选择器为全局 id，不能用 scoped） */
#home-recent-list {
	display: flex;
	position: absolute;
	flex-direction: column;
	left: 170px;
	top: 100px;
	width: 466px;
	height: 422px;
	row-gap: 10px;
	overflow: hidden;
	/* background-color: blue; */
}
</style>
