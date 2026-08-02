<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSpriteLayer-properties-grid') || 'Sprite Layer' }}</DetailSummary>
		<detail-grid id="animSpriteLayer-properties-grid">
			<text>{{ local.getLabel('animSpriteLayer-sprite') || 'Sprite' }}</text><select-box id="animSpriteLayer-sprite"></select-box>
			<text>{{ local.getLabel('animSpriteLayer-blend') || 'Blend' }}</text><select-box id="animSpriteLayer-blend"></select-box>
			<text>{{ local.getLabel('animSpriteLayer-light') || 'Light Sampling' }}</text
			><select-box id="animSpriteLayer-light"></select-box>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
