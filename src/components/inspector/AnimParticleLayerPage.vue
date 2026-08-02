<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animParticleLayer-properties-grid') || 'Particle Layer' }}</DetailSummary>
		<detail-grid id="animParticleLayer-properties-grid">
			<text>{{ local.getLabel('animParticleLayer-particleId') || 'Particle' }}</text
			><custom-box
				id="animParticleLayer-particleId"
				type="file"
				filter="particle"
			></custom-box>
			<text>{{ local.getLabel('animParticleLayer-position') || 'Position' }}</text
			><select-box id="animParticleLayer-position"></select-box>
			<text>{{ local.getLabel('animParticleLayer-angle') || 'Angle' }}</text><select-box id="animParticleLayer-angle"></select-box>
			<text>{{ local.getLabel('animParticleLayer-order') || 'Order' }}</text><select-box id="animParticleLayer-order"></select-box>
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
