<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSpriteLayer-properties-grid') || 'Sprite Layer' }}</DetailSummary>
		<div class="detail-grid" id="animSpriteLayer-properties-grid">
			<div class="text">{{ local.getLabel('animSpriteLayer-sprite') || 'Sprite' }}</div><SelectBox id="animSpriteLayer-sprite" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('animSpriteLayer-blend') || 'Blend' }}</div><SelectBox id="animSpriteLayer-blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('animSpriteLayer-light') || 'Light Sampling' }}</div
			><SelectBox id="animSpriteLayer-light" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.animSpriteLayer?.paramInput?.({ target });
};

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
