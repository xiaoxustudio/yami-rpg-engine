<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animParticleLayer-properties-grid') || 'Particle Layer' }}</DetailSummary>
		<detail-grid id="animParticleLayer-properties-grid">
			<text>{{ local.getLabel('animParticleLayer-particleId') || 'Particle' }}</text
			><CustomBox
				id="animParticleLayer-particleId"
				type="file"
				filter="particle"
			></CustomBox>
			<text>{{ local.getLabel('animParticleLayer-position') || 'Position' }}</text
			><SelectBox id="animParticleLayer-position"></SelectBox>
			<text>{{ local.getLabel('animParticleLayer-angle') || 'Angle' }}</text><SelectBox id="animParticleLayer-angle"></SelectBox>
			<text>{{ local.getLabel('animParticleLayer-order') || 'Order' }}</text><SelectBox id="animParticleLayer-order"></SelectBox>
		</detail-grid>
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
