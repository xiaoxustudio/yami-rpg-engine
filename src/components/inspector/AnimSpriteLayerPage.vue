<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSpriteLayer-properties-grid') || 'Sprite Layer' }}</DetailSummary>
		<detail-grid id="animSpriteLayer-properties-grid">
			<text>{{ local.getLabel('animSpriteLayer-sprite') || 'Sprite' }}</text><SelectBox id="animSpriteLayer-sprite"></SelectBox>
			<text>{{ local.getLabel('animSpriteLayer-blend') || 'Blend' }}</text><SelectBox id="animSpriteLayer-blend"></SelectBox>
			<text>{{ local.getLabel('animSpriteLayer-light') || 'Light Sampling' }}</text
			><SelectBox id="animSpriteLayer-light"></SelectBox>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
