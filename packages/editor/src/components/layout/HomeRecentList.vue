<template>
	<div class="box" id="home-recent-list" tabindex="-1" @click="onRecentClick" @pointerup="onRecentPointerup">
		<div class="item home-list-label" id="home-recent-label">Recent</div>
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
				<div v-for="(text, i) in card.stats" :key="i" class="home-recent-data text">{{ text }}</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Home, type HomeRecentCard } from '@app/legacy/title/home-page.ts';

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
