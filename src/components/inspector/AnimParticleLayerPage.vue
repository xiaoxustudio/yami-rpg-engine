<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animParticleLayer-properties-grid') || 'Particle Layer' }}</DetailSummary>
		<div class="detail-grid" id="animParticleLayer-properties-grid">
			<div class="text">{{ local.getLabel('animParticleLayer-particleId') || 'Particle' }}</div
			><CustomBox
				id="animParticleLayer-particleId"
				type="file"
				filter="particle"
			></CustomBox>
			<div class="text">{{ local.getLabel('animParticleLayer-position') || 'Position' }}</div
			><SelectBox id="animParticleLayer-position"></SelectBox>
			<div class="text">{{ local.getLabel('animParticleLayer-angle') || 'Angle' }}</div><SelectBox id="animParticleLayer-angle"></SelectBox>
			<div class="text">{{ local.getLabel('animParticleLayer-order') || 'Order' }}</div><SelectBox id="animParticleLayer-order"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
